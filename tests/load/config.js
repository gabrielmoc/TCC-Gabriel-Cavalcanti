export const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:3000";
export const userId = __ENV.USER_ID || "1";
export const scenarioLabel = __ENV.SCENARIO_LABEL || "baseline";
export const loadProfile = __ENV.LOAD_PROFILE || "ramp-strong";
export const startVus = Number(__ENV.START_VUS || 5);
export const targetVus = Number(__ENV.RAMP_TARGET_VUS || 60);
export const rampUpDuration = __ENV.RAMP_UP_DURATION || "30s";
export const sustainDuration = __ENV.SUSTAIN_DURATION || "60s";
export const rampDownDuration = __ENV.RAMP_DOWN_DURATION || "20s";
export const sleepSeconds = Number(__ENV.SLEEP_SECONDS || 0.1);

export const commonThresholds = {
  http_req_failed: ["rate<0.05"],
  http_req_duration: ["p(95)<1500"],
};

export function recommendationsUrl() {
  return `${baseUrl}/api/recommendations/${userId}`;
}

export function catalogUrl() {
  const itemId = __ENV.CATALOG_ITEM_ID;
  return itemId ? `${baseUrl}/api/catalog/${itemId}` : `${baseUrl}/api/catalog`;
}
