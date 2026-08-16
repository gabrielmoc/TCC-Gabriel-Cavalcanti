import http from "k6/http";
import { check } from "k6";
import { catalogUrl, recommendationsUrl } from "./config.js";

export function executeRecommendationsRequest(tags = {}) {
  const response = http.get(recommendationsUrl(), {
    tags: {
      endpoint: "recommendations",
      ...tags,
    },
  });

  check(response, {
    "status 200": (res) => res.status === 200,
    "response has userId": (res) => {
      try {
        return JSON.parse(res.body).userId !== undefined;
      } catch {
        return false;
      }
    },
    "response has recommendations": (res) => {
      try {
        const payload = JSON.parse(res.body);
        return Array.isArray(payload.recommendations);
      } catch {
        return false;
      }
    },
  });

  return response;
}

export function executeCatalogRequest(tags = {}) {
  const response = http.get(catalogUrl(), {
    tags: {
      endpoint: "catalog",
      ...tags,
    },
  });

  check(response, {
    "status 200": (res) => res.status === 200,
    "response is array or object": (res) => {
      try {
        const payload = JSON.parse(res.body);
        return Array.isArray(payload) || typeof payload === "object";
      } catch {
        return false;
      }
    },
  });

  return response;
}
