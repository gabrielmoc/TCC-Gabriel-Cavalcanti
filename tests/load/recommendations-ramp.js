import { sleep } from "k6";
import { commonThresholds, scenarioLabel } from "./config.js";
import { executeRecommendationsRequest } from "./utils.js";

export const options = {
  tags: {
    scenario_label: scenarioLabel,
    load_profile: "ramp",
  },
  scenarios: {
    ramp_load: {
      executor: "ramping-vus",
      startVUs: Number(__ENV.START_VUS || 1),
      stages: [
        { duration: __ENV.RAMP_UP_DURATION || "30s", target: Number(__ENV.RAMP_TARGET_VUS || 15) },
        { duration: __ENV.SUSTAIN_DURATION || "30s", target: Number(__ENV.RAMP_TARGET_VUS || 15) },
        { duration: __ENV.RAMP_DOWN_DURATION || "15s", target: 0 },
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: commonThresholds,
};

export default function () {
  executeRecommendationsRequest({
    scenario_label: scenarioLabel,
    load_profile: "ramp",
  });

  sleep(Number(__ENV.SLEEP_SECONDS || 1));
}
