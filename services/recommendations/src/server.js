const express = require("express");
const { randomUUID } = require("node:crypto");
const {
  parsePositiveInteger,
  sendError,
  sendNotFound,
} = require("../../../shared/http/response");
const { createRuntimeMetrics } = require("../../../shared/runtime/metrics");

const app = express();
const port = Number(process.env.RECOMMENDATIONS_SERVICE_PORT || 3003);
const usersServiceUrl = process.env.USERS_SERVICE_URL || "http://localhost:3002";
const catalogServiceUrl =
  process.env.CATALOG_SERVICE_URL || "http://localhost:3001";
const catalogRetrievalMode =
  process.env.CATALOG_RETRIEVAL_MODE || "catalog-service";
const solrUrl = process.env.SOLR_URL || "http://127.0.0.1:8983/solr/catalog";
const metrics = createRuntimeMetrics("recommendations");

if (!["catalog-service", "solr"].includes(catalogRetrievalMode)) {
  throw new Error(
    `Unsupported CATALOG_RETRIEVAL_MODE: ${catalogRetrievalMode}`
  );
}

function solrGenreFilter(preferredGenres) {
  return preferredGenres
    .map((genre) => `"${String(genre).replaceAll('"', '\\"')}"`)
    .join(" OR ");
}

async function fetchCatalogFromSolr(preferredGenres, requestId) {
  const params = new URLSearchParams({
    q: "*:*",
    fq: `genre:(${solrGenreFilter(preferredGenres)})`,
    fl: "id,title,genre,year",
    sort: "sortOrder_i asc",
    rows: "1500",
    wt: "json",
  });
  const startedAt = Date.now();
  const response = await fetch(`${solrUrl}/select?${params.toString()}`, {
    headers: {
      "x-request-id": requestId,
    },
  });

  if (!response.ok) {
    throw new Error(`Solr returned HTTP ${response.status}`);
  }

  const payload = await response.json();

  return {
    items: (payload.response?.docs || []).map((document) => ({
      id: Number(document.id),
      title: Array.isArray(document.title) ? document.title[0] : document.title,
      genre: Array.isArray(document.genre) ? document.genre[0] : document.genre,
      year: Number(Array.isArray(document.year) ? document.year[0] : document.year),
    })),
    durationMs: Date.now() - startedAt,
  };
}

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  const startedAt = Date.now();

  res.locals.requestId = requestId;
  res.set("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const userDuration = res.locals.usersDurationMs ?? "n/a";
    const catalogDuration = res.locals.catalogDurationMs ?? "n/a";
    const errorCode = res.locals.errorCode || "n/a";

    metrics.recordRequest(res.statusCode, durationMs);

    console.log(
      [
        "recommendations request",
        `id=${requestId}`,
        `${req.method} ${req.originalUrl}`,
        `status=${res.statusCode}`,
        `durationMs=${durationMs}`,
        `usersMs=${userDuration}`,
        `catalogMs=${catalogDuration}`,
        `error=${errorCode}`,
      ].join(" | ")
    );
  });

  next();
});

app.get("/recommendations/:userId", async (req, res) => {
  const userId = parsePositiveInteger(req.params.userId);

  if (!userId) {
    return sendError(
      res,
      400,
      "INVALID_RESOURCE_ID",
      "O identificador do usuário deve ser um inteiro positivo."
    );
  }

  try {
    const usersStartedAt = Date.now();
    const userResponsePromise = fetch(`${usersServiceUrl}/users/${userId}`, {
      headers: {
        "x-request-id": res.locals.requestId,
      },
    }).then((response) => {
      res.locals.usersDurationMs = Date.now() - usersStartedAt;
      return response;
    });

    const catalogResponsePromise =
      catalogRetrievalMode === "solr"
        ? null
        : (() => {
            const catalogStartedAt = Date.now();
            return fetch(`${catalogServiceUrl}/catalog`, {
              headers: {
                "x-request-id": res.locals.requestId,
              },
            }).then((response) => {
              res.locals.catalogDurationMs = Date.now() - catalogStartedAt;
              return response;
            });
          })();

    const userResponse = await userResponsePromise;

    if (userResponse.status === 404) {
      return sendError(
        res,
        404,
        "USER_NOT_FOUND",
        "Usuário não encontrado."
      );
    }

    if (!userResponse.ok) {
      return sendError(
        res,
        502,
        "UPSTREAM_UNAVAILABLE",
        "Não foi possível consultar o serviço de usuários."
      );
    }

    const user = await userResponse.json();
    let recommendations;

    if (catalogRetrievalMode === "solr") {
      const solrResult = await fetchCatalogFromSolr(
        user.preferredGenres,
        res.locals.requestId
      );
      res.locals.catalogDurationMs = solrResult.durationMs;
      metrics.incrementCounter("catalogSource", "solr");
      recommendations = solrResult.items;
      res.set("X-Data-Source", "solr");
    } else {
      const catalogResponse = await catalogResponsePromise;

      if (!catalogResponse.ok) {
        return sendError(
          res,
          502,
          "UPSTREAM_UNAVAILABLE",
          "Não foi possível consultar o serviço de catálogo."
        );
      }

      const catalog = await catalogResponse.json();
      metrics.incrementCounter("catalogSource", "catalog-service");
      recommendations = catalog.filter((item) =>
        user.preferredGenres.includes(item.genre)
      );
    }

    return res.json({
      userId: user.id,
      recommendations,
    });
  } catch (error) {
    console.error(`recommendations request failed: ${error.message}`);
    return sendError(
      res,
      500,
      "RECOMMENDATIONS_INTERNAL_ERROR",
      "Não foi possível gerar recomendações."
    );
  }
});

app.get("/health", (_req, res) => {
  res.json({
    service: "recommendations",
    status: "ok",
  });
});

app.get("/metrics", (_req, res) => {
  res.json(metrics.snapshot());
});

app.use((_req, res) => sendNotFound(res));

app.listen(port, () => {
  console.log(`recommendations listening on port ${port}`);
});
