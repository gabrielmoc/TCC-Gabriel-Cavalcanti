import { sleep } from "k6";
import { commonThresholds, scenarioLabel, sleepSeconds } from "./config.js";
import { executeRecommendationsRequest } from "./utils.js";

const stages = JSON.parse(
  __ENV.VARIABLE_STAGES ||
    '[{"duration":"20s","target":30},{"duration":"30s","target":30},{"duration":"20s","target":10},{"duration":"30s","target":10},{"duration":"30s","target":70},{"duration":"45s","target":70},{"duration":"20s","target":0}]'
);

export const options = {
  tags: {
    scenario_label: scenarioLabel,
    load_profile: "variavel",
    endpoint: "recommendations",
  },
  scenarios: {
    variable_load: {
      executor: "ramping-vus",
      startVUs: Number(__ENV.START_VUS || 5),
      stages,
      gracefulRampDown: "5s",
    },
  },
  thresholds: commonThresholds,
};

export default function () {
  executeRecommendationsRequest({
    scenario_label: scenarioLabel,
    load_profile: "variavel",
  });

  sleep(sleepSeconds);
}
