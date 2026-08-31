import { sleep } from "k6";
import {
  commonThresholds,
  loadProfile,
  rampDownDuration,
  rampUpDuration,
  scenarioLabel,
  sleepSeconds,
  startVus,
  sustainDuration,
  targetVus,
} from "./config.js";
import { executeCatalogRequest } from "./utils.js";

export const options = {
  tags: {
    scenario_label: scenarioLabel,
    load_profile: loadProfile,
    endpoint: "catalog",
  },
  scenarios: {
    ramp_load: {
      executor: "ramping-vus",
      startVUs: startVus,
      stages: [
        { duration: rampUpDuration, target: targetVus },
        { duration: sustainDuration, target: targetVus },
        { duration: rampDownDuration, target: 0 },
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: commonThresholds,
};

export default function () {
  executeCatalogRequest({
    scenario_label: scenarioLabel,
    load_profile: loadProfile,
  });

  sleep(sleepSeconds);
}
