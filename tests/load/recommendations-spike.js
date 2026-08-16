import { sleep } from "k6";
import { commonThresholds, scenarioLabel } from "./config.js";
import { executeRecommendationsRequest } from "./utils.js";

export const options = {
  tags: {
    scenario_label: scenarioLabel,
    load_profile: "spike",
  },
  scenarios: {
    spike_load: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: __ENV.SPIKE_UP_DURATION || "10s", target: Number(__ENV.SPIKE_TARGET_VUS || 30) },
        { duration: __ENV.SPIKE_HOLD_DURATION || "15s", target: Number(__ENV.SPIKE_TARGET_VUS || 30) },
        { duration: __ENV.SPIKE_DOWN_DURATION || "10s", target: 1 },
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: commonThresholds,
};

export default function () {
  executeRecommendationsRequest({
    scenario_label: scenarioLabel,
    load_profile: "spike",
  });

  sleep(Number(__ENV.SLEEP_SECONDS || 1));
}
