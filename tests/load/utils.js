import http from "k6/http";
import { check } from "k6";
import { recommendationsUrl } from "./config.js";

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
