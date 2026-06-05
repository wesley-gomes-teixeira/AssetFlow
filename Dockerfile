FROM node:20-bookworm AS builder

WORKDIR /build

# Copiar todos os serviços
COPY users-service ./users-service
COPY assets-service ./assets-service
COPY tickets-service ./tickets-service
COPY gateway-service ./gateway-service
COPY frontend-service ./frontend-service

# Build todos os serviços (otimizado)
RUN set -e && \
    cd users-service && npm install && npm run build && \
    cd ../assets-service && npm install && npm run build && \
    cd ../tickets-service && npm install && npm run build && \
    cd ../gateway-service && npm install && npm run build && \
    cd ../frontend-service && npm install && npm run build && \
    cd ..

# Stage final - runtime
FROM node:20-bookworm

LABEL org.opencontainers.image.title="AssetFlow"
LABEL org.opencontainers.image.description="Microservices-based IT Asset Management System"
LABEL org.opencontainers.image.version="1.0.0"

# Instalar apenas curl para health checks
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

WORKDIR /app

# Copiar scripts de orquestração
COPY docker/render/start-web.sh /usr/local/bin/start-web.sh
RUN chmod +x /usr/local/bin/start-web.sh

# Copiar código compilado e node_modules
COPY --from=builder /build/users-service/dist ./users-service/dist
COPY --from=builder /build/users-service/package.json ./users-service/
COPY --from=builder /build/users-service/node_modules ./users-service/node_modules

COPY --from=builder /build/assets-service/dist ./assets-service/dist
COPY --from=builder /build/assets-service/package.json ./assets-service/
COPY --from=builder /build/assets-service/node_modules ./assets-service/node_modules

COPY --from=builder /build/tickets-service/dist ./tickets-service/dist
COPY --from=builder /build/tickets-service/package.json ./tickets-service/
COPY --from=builder /build/tickets-service/node_modules ./tickets-service/node_modules

COPY --from=builder /build/gateway-service/dist ./gateway-service/dist
COPY --from=builder /build/gateway-service/package.json ./gateway-service/
COPY --from=builder /build/gateway-service/node_modules ./gateway-service/node_modules

COPY --from=builder /build/frontend-service/dist ./frontend-service/dist
COPY --from=builder /build/frontend-service/public ./frontend-service/public
COPY --from=builder /build/frontend-service/package.json ./frontend-service/
COPY --from=builder /build/frontend-service/node_modules ./frontend-service/node_modules

# Usar diretório workspace para manter compatibilidade com start-web.sh
RUN mkdir -p /workspace && \
    ln -s /app/* /workspace/ && \
    cd /app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-10000}/health || exit 1

# Portas de serviço (documentação, só usa 10000)
EXPOSE 10000 3000 3001 3002 3003 8080

# Non-root user para segurança
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app /workspace /usr/local/bin/start-web.sh
USER appuser

# Entrypoint
CMD ["/usr/local/bin/start-web.sh"]
