#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVICES=(gateway services/catalog services/users services/recommendations)

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20 ou superior é necessário."
  exit 1
fi

NODE_MAJOR_VERSION="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR_VERSION" -lt 20 ]; then
  echo "Node.js 20 ou superior é necessário; versão encontrada: $(node --version)."
  exit 1
fi

echo "Instalando dependências dos serviços..."
for service in "${SERVICES[@]}"; do
  echo "- ${service}"
  npm ci --prefix "${ROOT_DIR}/${service}"
done

echo
echo "Verificações opcionais para todos os cenários:"
command -v redis-server >/dev/null 2>&1 && echo "- redis-server: disponível" || echo "- redis-server: ausente (necessário para smoke e cenário Redis)"
docker compose version >/dev/null 2>&1 && echo "- Docker Compose: disponível" || echo "- Docker Compose: ausente (necessário para o cenário Solr)"
command -v k6 >/dev/null 2>&1 && echo "- k6: disponível" || echo "- k6: ausente (necessário para testes de carga)"

echo
echo "Bootstrap concluído. Consulte README.md para executar os cenários e testes."
