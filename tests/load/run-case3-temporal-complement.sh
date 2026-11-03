#!/usr/bin/env bash

set -euo pipefail

SCENARIO="${1:-}"
RUN_NUMBER="${2:-}"

if [[ -z "${SCENARIO}" || -z "${RUN_NUMBER}" ]]; then
  echo "uso: tests/load/run-case3-temporal-complement.sh <baseline|redis-cache|solr> <numero-da-rodada>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# A coleta complementar nunca sobrescreve a matriz final original.
RESULTS_ROOT="${ROOT_DIR}/results/${SCENARIO}/complementar-temporal-2026-11" \
K6_JSON_OUTPUT_FILENAME="k6-samples.ndjson" \
bash "${ROOT_DIR}/tests/load/run-final-matrix.sh" "${SCENARIO}" "case-3" "${RUN_NUMBER}"

node "${ROOT_DIR}/tests/load/analyze-case3-temporal.mjs" \
  --input "${ROOT_DIR}/results/${SCENARIO}/complementar-temporal-2026-11/case-3/recommendations/run-${RUN_NUMBER}/k6-samples.ndjson" \
  --output "${ROOT_DIR}/results/${SCENARIO}/complementar-temporal-2026-11/case-3/recommendations/run-${RUN_NUMBER}/temporal-summary.json"

# Mantem a fonte temporal rastreavel sem inflar o repositorio com arquivos NDJSON.
gzip -9 "${ROOT_DIR}/results/${SCENARIO}/complementar-temporal-2026-11/case-3/recommendations/run-${RUN_NUMBER}/k6-samples.ndjson"
