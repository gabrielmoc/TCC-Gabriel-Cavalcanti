#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SCENARIOS=(baseline redis-cache solr)
CASES=(case-1 case-2 case-3)
RUNS=(01 02 03)

for scenario in "${SCENARIOS[@]}"; do
  for case_id in "${CASES[@]}"; do
    for run_number in "${RUNS[@]}"; do
      "${ROOT_DIR}/tests/load/run-final-matrix.sh" \
        "${scenario}" \
        "${case_id}" \
        "${run_number}"
    done

    node "${ROOT_DIR}/tests/load/aggregate-results.mjs" \
      "results/${scenario}/matriz-final/${case_id}/recommendations"
  done
done

echo "Matriz final concluída para baseline, Redis e Solr."
