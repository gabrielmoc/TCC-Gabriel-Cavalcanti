#!/usr/bin/env bash

set -euo pipefail

SCENARIO="${1:-}"
CASE_ID="${2:-}"
RUN_NUMBER="${3:-}"

if [[ -z "${SCENARIO}" || -z "${CASE_ID}" || -z "${RUN_NUMBER}" ]]; then
  echo "uso: tests/load/run-final-matrix.sh <baseline|redis-cache|solr> <case-1|case-2|case-3> <numero-da-rodada>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
RESULTS_DIR="${ROOT_DIR}/results/${SCENARIO}/matriz-final/${CASE_ID}/recommendations/run-${RUN_NUMBER}"
PORTS=(3000 3001 3002 3003)
mkdir -p "${RESULTS_DIR}"

case "${CASE_ID}" in
  case-1)
    PROFILE="baixa-controlada"
    SCRIPT_PATH="tests/load/recommendations-ramp-strong.js"
    START_VUS=1
    RAMP_TARGET_VUS=5
    RAMP_UP_DURATION="10s"
    SUSTAIN_DURATION="60s"
    RAMP_DOWN_DURATION="10s"
    SLEEP_SECONDS="0.15"
    ;;
  case-2)
    PROFILE="alta-sustentada"
    SCRIPT_PATH="tests/load/recommendations-ramp-strong.js"
    START_VUS=10
    RAMP_TARGET_VUS=90
    RAMP_UP_DURATION="40s"
    SUSTAIN_DURATION="120s"
    RAMP_DOWN_DURATION="30s"
    SLEEP_SECONDS="0.10"
    ;;
  case-3)
    PROFILE="variavel"
    SCRIPT_PATH="tests/load/recommendations-variable.js"
    START_VUS=5
    RAMP_TARGET_VUS=70
    RAMP_UP_DURATION="n/a"
    SUSTAIN_DURATION="n/a"
    RAMP_DOWN_DURATION="n/a"
    SLEEP_SECONDS="0.10"
    VARIABLE_STAGES='[{"duration":"20s","target":30},{"duration":"30s","target":30},{"duration":"20s","target":10},{"duration":"30s","target":10},{"duration":"30s","target":70},{"duration":"45s","target":70},{"duration":"20s","target":0}]'
    ;;
  *)
    echo "case inválido: ${CASE_ID}. Use case-1, case-2 ou case-3."
    exit 1
    ;;
esac

if [[ "${SCENARIO}" != "baseline" && "${SCENARIO}" != "redis-cache" && "${SCENARIO}" != "solr" ]]; then
  echo "cenário inválido: ${SCENARIO}. Use baseline, redis-cache ou solr."
  exit 1
fi

REDIS_SERVER_BIN="${REDIS_SERVER_BIN:-$(command -v redis-server || true)}"
REDIS_PID=""
SOLR_STARTED="false"

cleanup() {
  for pid in "${GATEWAY_PID:-}" "${CATALOG_PID:-}" "${USERS_PID:-}" "${RECOMMENDATIONS_PID:-}" "${REDIS_PID:-}"; do
    if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
      kill "${pid}" 2>/dev/null || true
      wait "${pid}" 2>/dev/null || true
    fi
  done

  if command -v lsof >/dev/null 2>&1; then
    for port in "${PORTS[@]}"; do
      pids="$(lsof -ti tcp:"${port}" 2>/dev/null || true)"
      if [[ -n "${pids}" ]]; then
        kill ${pids} 2>/dev/null || true
      fi
    done
  fi

  if [[ "${SOLR_STARTED}" == "true" ]]; then
    docker compose -f "${ROOT_DIR}/compose.yaml" stop solr >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

if command -v lsof >/dev/null 2>&1; then
  for port in "${PORTS[@]}"; do
    existing_pids="$(lsof -ti tcp:"${port}" 2>/dev/null || true)"
    if [[ -n "${existing_pids}" ]]; then
      kill ${existing_pids} 2>/dev/null || true
      sleep 1
    fi
  done
fi

CATALOG_CACHE_ENABLED="false"
CATALOG_RETRIEVAL_MODE="catalog-service"

if [[ "${SCENARIO}" == "redis-cache" ]]; then
  if [[ -z "${REDIS_SERVER_BIN}" ]]; then
    echo "redis-server não encontrado."
    exit 1
  fi

  CATALOG_CACHE_ENABLED="true"
  "${REDIS_SERVER_BIN}" --port 6379 --save "" --appendonly no > "${RESULTS_DIR}/redis.log" 2>&1 &
  REDIS_PID=$!
fi

if [[ "${SCENARIO}" == "solr" ]]; then
  docker compose -f "${ROOT_DIR}/compose.yaml" up -d solr > "${RESULTS_DIR}/solr-compose.log" 2>&1
  SOLR_STARTED="true"

  for _ in {1..60}; do
    if curl -sf "http://127.0.0.1:8983/solr/catalog/admin/ping" >/dev/null; then
      break
    fi
    sleep 1
  done

  if ! curl -sf "http://127.0.0.1:8983/solr/catalog/admin/ping" >/dev/null; then
    echo "Solr não ficou disponível no tempo esperado."
    exit 1
  fi

  SOLR_URL="http://127.0.0.1:8983/solr/catalog" node "${ROOT_DIR}/services/solr/index-catalog.mjs" > "${RESULTS_DIR}/solr-index.log" 2>&1
  CATALOG_RETRIEVAL_MODE="solr"
fi

export GATEWAY_PORT=3000
export CATALOG_SERVICE_PORT=3001
export USERS_SERVICE_PORT=3002
export RECOMMENDATIONS_SERVICE_PORT=3003
export CATALOG_CACHE_ENABLED
export CATALOG_CACHE_TTL_SECONDS="${CATALOG_CACHE_TTL_SECONDS:-60}"
export CATALOG_REDIS_URL="redis://127.0.0.1:6379"
export CATALOG_RETRIEVAL_MODE
export SOLR_URL="http://127.0.0.1:8983/solr/catalog"
export CATALOG_SERVICE_URL="http://127.0.0.1:3001"
export USERS_SERVICE_URL="http://127.0.0.1:3002"
export RECOMMENDATIONS_SERVICE_URL="http://127.0.0.1:3003"

(cd "${ROOT_DIR}/services/catalog" && exec node src/server.js > "${RESULTS_DIR}/catalog.log" 2>&1) &
CATALOG_PID=$!
(cd "${ROOT_DIR}/services/users" && exec node src/server.js > "${RESULTS_DIR}/users.log" 2>&1) &
USERS_PID=$!
(cd "${ROOT_DIR}/services/recommendations" && exec node src/server.js > "${RESULTS_DIR}/recommendations.log" 2>&1) &
RECOMMENDATIONS_PID=$!
(cd "${ROOT_DIR}/gateway" && exec node src/server.js > "${RESULTS_DIR}/gateway.log" 2>&1) &
GATEWAY_PID=$!

for port in 3000 3001 3002 3003; do
  for _ in {1..40}; do
    if curl -sf "http://127.0.0.1:${port}/health" >/dev/null; then
      break
    fi
    sleep 0.5
  done
done

if ! curl -sf "http://127.0.0.1:3000/health" >/dev/null; then
  echo "Gateway não iniciou corretamente."
  exit 1
fi

# O aquecimento exclui o primeiro preenchimento do Redis da janela medida.
curl -sf "http://127.0.0.1:3000/api/recommendations/1" > "${RESULTS_DIR}/warmup-response.json"

cat > "${RESULTS_DIR}/metadata.json" <<EOF
{
  "scenario": "${SCENARIO}",
  "case": "${CASE_ID}",
  "profile": "${PROFILE}",
  "endpoint": "recommendations",
  "script": "${SCRIPT_PATH}",
  "run": "${RUN_NUMBER}",
  "startVUs": ${START_VUS},
  "targetVUs": ${RAMP_TARGET_VUS},
  "rampUp": "${RAMP_UP_DURATION}",
  "sustain": "${SUSTAIN_DURATION}",
  "rampDown": "${RAMP_DOWN_DURATION}",
  "variableStages": ${VARIABLE_STAGES:-null},
  "sleepSeconds": ${SLEEP_SECONDS},
  "cacheWarmup": true,
  "date": "$(date +%d/%m/%Y)"
}
EOF

node "${ROOT_DIR}/tests/load/collect-runtime-metrics.mjs" --output "${RESULTS_DIR}/runtime-metrics-before.json"

cd "${ROOT_DIR}"
BASE_URL="http://127.0.0.1:3000" \
SCENARIO_LABEL="${SCENARIO}" \
LOAD_PROFILE="${PROFILE}" \
START_VUS="${START_VUS}" \
RAMP_TARGET_VUS="${RAMP_TARGET_VUS}" \
RAMP_UP_DURATION="${RAMP_UP_DURATION}" \
SUSTAIN_DURATION="${SUSTAIN_DURATION}" \
RAMP_DOWN_DURATION="${RAMP_DOWN_DURATION}" \
SLEEP_SECONDS="${SLEEP_SECONDS}" \
VARIABLE_STAGES="${VARIABLE_STAGES:-}" \
k6 run --summary-export="${RESULTS_DIR}/k6-summary.json" "${SCRIPT_PATH}" > "${RESULTS_DIR}/k6-output.txt"

node "${ROOT_DIR}/tests/load/collect-runtime-metrics.mjs" --output "${RESULTS_DIR}/runtime-metrics-after.json"

if [[ "${SCENARIO}" == "solr" ]]; then
  docker stats --no-stream --format '{{json .}}' tcc-solr > "${RESULTS_DIR}/solr-runtime-metrics.json" || true
  docker compose -f "${ROOT_DIR}/compose.yaml" logs --no-color solr > "${RESULTS_DIR}/solr.log" || true
fi
