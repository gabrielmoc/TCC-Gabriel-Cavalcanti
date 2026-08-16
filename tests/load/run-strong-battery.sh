#!/usr/bin/env bash

set -euo pipefail

SCENARIO="${1:-}"
ENDPOINT="${2:-}"
RUN_NUMBER="${3:-}"

if [[ -z "${SCENARIO}" || -z "${ENDPOINT}" || -z "${RUN_NUMBER}" ]]; then
  echo "usage: tests/load/run-strong-battery.sh <baseline|redis-cache> <catalog|recommendations> <run-number>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
RESULTS_DIR="${ROOT_DIR}/results/${SCENARIO}/ramp-strong/${ENDPOINT}/run-${RUN_NUMBER}"
mkdir -p "${RESULTS_DIR}"

START_VUS="${START_VUS:-5}"
RAMP_TARGET_VUS="${RAMP_TARGET_VUS:-60}"
RAMP_UP_DURATION="${RAMP_UP_DURATION:-30s}"
SUSTAIN_DURATION="${SUSTAIN_DURATION:-60s}"
RAMP_DOWN_DURATION="${RAMP_DOWN_DURATION:-20s}"
SLEEP_SECONDS="${SLEEP_SECONDS:-0.1}"

SCRIPT_PATH="tests/load/recommendations-ramp-strong.js"
if [[ "${ENDPOINT}" == "catalog" ]]; then
  SCRIPT_PATH="tests/load/catalog-ramp.js"
fi

CATALOG_CACHE_ENABLED="false"
REDIS_PID=""
if [[ "${SCENARIO}" == "redis-cache" ]]; then
  CATALOG_CACHE_ENABLED="true"
  /opt/homebrew/bin/redis-server \
    --port 6379 \
    --save "" \
    --appendonly no \
    > "${RESULTS_DIR}/redis.log" 2>&1 &
  REDIS_PID=$!
fi

cleanup() {
  for pid in "${GATEWAY_PID:-}" "${CATALOG_PID:-}" "${USERS_PID:-}" "${RECOMMENDATIONS_PID:-}" "${REDIS_PID:-}"; do
    if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
      kill "${pid}" 2>/dev/null || true
      wait "${pid}" 2>/dev/null || true
    fi
  done
}

trap cleanup EXIT

export GATEWAY_PORT=3000
export CATALOG_SERVICE_PORT=3001
export USERS_SERVICE_PORT=3002
export RECOMMENDATIONS_SERVICE_PORT=3003
export CATALOG_CACHE_ENABLED
export CATALOG_CACHE_TTL_SECONDS="${CATALOG_CACHE_TTL_SECONDS:-60}"
export CATALOG_REDIS_URL="${CATALOG_REDIS_URL:-redis://127.0.0.1:6379}"
export CATALOG_SERVICE_URL="http://127.0.0.1:3001"
export USERS_SERVICE_URL="http://127.0.0.1:3002"
export RECOMMENDATIONS_SERVICE_URL="http://127.0.0.1:3003"

(cd "${ROOT_DIR}/services/catalog" && npm start > "${RESULTS_DIR}/catalog.log" 2>&1) &
CATALOG_PID=$!
(cd "${ROOT_DIR}/services/users" && npm start > "${RESULTS_DIR}/users.log" 2>&1) &
USERS_PID=$!
(cd "${ROOT_DIR}/services/recommendations" && npm start > "${RESULTS_DIR}/recommendations.log" 2>&1) &
RECOMMENDATIONS_PID=$!
(cd "${ROOT_DIR}/gateway" && npm start > "${RESULTS_DIR}/gateway.log" 2>&1) &
GATEWAY_PID=$!

for port in 3000 3001 3002 3003; do
  for _ in {1..40}; do
    if curl -s "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
done

cat > "${RESULTS_DIR}/metadata.json" <<EOF
{
  "scenario": "${SCENARIO}",
  "endpoint": "${ENDPOINT}",
  "load_profile": "ramp-strong",
  "run": "${RUN_NUMBER}",
  "script": "${SCRIPT_PATH}",
  "startVUs": ${START_VUS},
  "targetVUs": ${RAMP_TARGET_VUS},
  "rampUp": "${RAMP_UP_DURATION}",
  "sustain": "${SUSTAIN_DURATION}",
  "rampDown": "${RAMP_DOWN_DURATION}",
  "sleepSeconds": ${SLEEP_SECONDS},
  "date": "$(date +%F)"
}
EOF

cd "${ROOT_DIR}"
BASE_URL="http://127.0.0.1:3000" \
SCENARIO_LABEL="${SCENARIO}" \
START_VUS="${START_VUS}" \
RAMP_TARGET_VUS="${RAMP_TARGET_VUS}" \
RAMP_UP_DURATION="${RAMP_UP_DURATION}" \
SUSTAIN_DURATION="${SUSTAIN_DURATION}" \
RAMP_DOWN_DURATION="${RAMP_DOWN_DURATION}" \
SLEEP_SECONDS="${SLEEP_SECONDS}" \
k6 run \
  --summary-export="${RESULTS_DIR}/k6-summary.json" \
  "${SCRIPT_PATH}" > "${RESULTS_DIR}/k6-output.txt"
