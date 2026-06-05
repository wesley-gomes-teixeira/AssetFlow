#!/usr/bin/env bash
set -euo pipefail

# Definir variáveis de ambiente padrão
export PORT="${PORT:-10000}"
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5432}"
export DB_USER="${DB_USER:-postgres}"
export DB_PASSWORD="${DB_PASSWORD:-postgres}"
export DB_NAME="${DB_NAME:-assetflow}"
export JWT_SECRET="${JWT_SECRET:-assetflow-secret}"
export DISABLE_RABBITMQ="${DISABLE_RABBITMQ:-true}"

# Log das configurações
echo "════════════════════════════════════════════"
echo "  AssetFlow Monolito"
echo "════════════════════════════════════════════"
echo "PORT: $PORT"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_NAME: $DB_NAME"
echo "DB_USER: $DB_USER"
echo "════════════════════════════════════════════"

# Executar o servidor
exec node /workspace/dist/server.js
