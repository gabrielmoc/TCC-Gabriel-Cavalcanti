import { sleep } from "k6";
import { commonThresholds, scenarioLabel } from "./config.js";
import { executeRecommendationsRequest } from "./utils.js";

export const options = {
  tags: {
    scenario_label: scenarioLabel,
    load_profile: "constant",
  },
  scenarios: {
    constant_load: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS || 10),
      duration: __ENV.DURATION || "30s",
    },
  },
  thresholds: commonThresholds,
};

export default function () {
  executeRecommendationsRequest({
    scenario_label: scenarioLabel,
    load_profile: "constant",
  });

  sleep(Number(__ENV.SLEEP_SECONDS || 1));
}
