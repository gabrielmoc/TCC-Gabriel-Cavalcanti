#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# A primeira rodada baseline ja foi usada para validar a instrumentacao.
for entry in \
  "baseline 02" \
  "baseline 03" \
  "redis-cache 01" \
  "redis-cache 02" \
  "redis-cache 03" \
  "solr 01" \
  "solr 02" \
  "solr 03"; do
  read -r scenario run <<< "${entry}"
  echo "=== complemento temporal: ${scenario}, rodada ${run} ==="
  bash "${ROOT_DIR}/tests/load/run-case3-temporal-complement.sh" "${scenario}" "${run}"
done
