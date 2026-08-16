const express = require("express");
const { randomUUID } = require("node:crypto");

const app = express();
const port = Number(process.env.RECOMMENDATIONS_SERVICE_PORT || 3003);
const usersServiceUrl = process.env.USERS_SERVICE_URL || "http://localhost:3002";
const catalogServiceUrl =
  process.env.CATALOG_SERVICE_URL || "http://localhost:3001";

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  const startedAt = Date.now();

  res.locals.requestId = requestId;
  res.set("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const userDuration = res.locals.usersDurationMs ?? "n/a";
    const catalogDuration = res.locals.catalogDurationMs ?? "n/a";

    console.log(
      [
        "recommendations request",
        `id=${requestId}`,
        `${req.method} ${req.originalUrl}`,
        `status=${res.statusCode}`,
        `durationMs=${durationMs}`,
        `usersMs=${userDuration}`,
        `catalogMs=${catalogDuration}`,
      ].join(" | ")
    );
  });

  next();
});

app.get("/recommendations/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  if (Number.isNaN(userId)) {
    return res.status(400).json({
      message: "Invalid user id",
    });
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

    const catalogStartedAt = Date.now();
    const catalogResponsePromise = fetch(`${catalogServiceUrl}/catalog`, {
      headers: {
        "x-request-id": res.locals.requestId,
      },
    }).then((response) => {
      res.locals.catalogDurationMs = Date.now() - catalogStartedAt;
      return response;
    });

    const [userResponse, catalogResponse] = await Promise.all([
      userResponsePromise,
      catalogResponsePromise,
    ]);

    if (userResponse.status === 404) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!userResponse.ok || !catalogResponse.ok) {
      return res.status(502).json({
        message: "Failed to fetch upstream services",
      });
    }

    const user = await userResponse.json();
    const catalog = await catalogResponse.json();

    const recommendations = catalog.filter((item) =>
      user.preferredGenres.includes(item.genre)
    );

    return res.json({
      userId: user.id,
      recommendations,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal recommendations error",
      error: error.message,
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({
    service: "recommendations",
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`recommendations listening on port ${port}`);
});
