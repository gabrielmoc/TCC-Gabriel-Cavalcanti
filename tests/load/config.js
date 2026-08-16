export const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:3000";
export const userId = __ENV.USER_ID || "1";
export const scenarioLabel = __ENV.SCENARIO_LABEL || "baseline";

export const commonThresholds = {
  http_req_failed: ["rate<0.05"],
  http_req_duration: ["p(95)<1500"],
};

export function recommendationsUrl() {
  return `${baseUrl}/api/recommendations/${userId}`;
}
