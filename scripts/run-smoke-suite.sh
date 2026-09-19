#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v redis-server >/dev/null 2>&1; then
  echo "redis-server é necessário para a suíte de smoke tests."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose é necessário para validar o cenário Solr."
  exit 1
fi

cd "$ROOT_DIR"

echo "[1/4] Validando baseline e contratos de erro..."
node tests/smoke/baseline-smoke.js

echo "[2/4] Validando cache Redis..."
node tests/smoke/catalog-cache-smoke.js

echo "[3/4] Validando fallback do Redis..."
node tests/smoke/catalog-cache-fallback-smoke.js

echo "[4/4] Validando cenário Solr..."
docker compose up -d solr

for attempt in {1..30}; do
  if curl --fail --silent --show-error "http://127.0.0.1:8983/solr/catalog/admin/ping" >/dev/null; then
    break
  fi

  if [ "$attempt" -eq 30 ]; then
    echo "Solr não ficou disponível em 30 segundos."
    exit 1
  fi

  sleep 1
done

node tests/smoke/solr-smoke.js

echo "Suíte de smoke tests concluída com sucesso."
