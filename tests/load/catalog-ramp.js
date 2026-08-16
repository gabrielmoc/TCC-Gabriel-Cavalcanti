import { sleep } from "k6";
import { commonThresholds, scenarioLabel } from "./config.js";
import { executeCatalogRequest } from "./utils.js";

export const options = {
  tags: {
    scenario_label: scenarioLabel,
    load_profile: "ramp-strong",
    endpoint: "catalog",
  },
  scenarios: {
    ramp_load: {
      executor: "ramping-vus",
      startVUs: Number(__ENV.START_VUS || 5),
      stages: [
        { duration: __ENV.RAMP_UP_DURATION || "30s", target: Number(__ENV.RAMP_TARGET_VUS || 60) },
        { duration: __ENV.SUSTAIN_DURATION || "60s", target: Number(__ENV.RAMP_TARGET_VUS || 60) },
        { duration: __ENV.RAMP_DOWN_DURATION || "20s", target: 0 },
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: commonThresholds,
};

export default function () {
  executeCatalogRequest({
    scenario_label: scenarioLabel,
    load_profile: "ramp-strong",
  });

  sleep(Number(__ENV.SLEEP_SECONDS || 0.1));
}
