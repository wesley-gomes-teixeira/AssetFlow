# 🚀 Guia de Deploy do AssetFlow Monolito

## Pré-Requisitos

- Node.js 18+
- PostgreSQL 13+
- Docker (opcional)
- npm/yarn
- Conta em uma plataforma de deploy (Railway, Fly.io, Render, etc.)

## 1. Teste Local

### 1.1 Preparar ambiente local

```bash
# Criar arquivo .env baseado em .env.example
cp .env.example .env

# Ajustar variáveis conforme seu ambiente
# Editar .env com suas credenciais PostgreSQL
```

### 1.2 Instalar dependências

```bash
npm install
```

### 1.3 Build

```bash
npm run build
```

### 1.4 Rodar localmente

```bash
npm start
```

Ou com recarregamento automático:
```bash
npm run dev
```

### 1.5 Testar endpoints

```bash
# Health check
curl http://localhost:10000/health

# Registrar usuário
curl -X POST http://localhost:10000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:10000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Copiar o token retornado
TOKEN="seu-token-aqui"

# Listar usuários (requer autenticação)
curl http://localhost:10000/users \
  -H "Authorization: Bearer $TOKEN"
```

## 2. Deploy com Docker

### 2.1 Build local da imagem

```bash
docker build -f Dockerfile.monolith -t assetflow-monolith:v1.0.0 .
```

### 2.2 Testar container localmente

```bash
docker run --rm -p 10000:10000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=yourpassword \
  -e DB_NAME=assetflow \
  -e JWT_SECRET=production-secret-key \
  assetflow-monolith:v1.0.0
```

### 2.3 Push para registry (Docker Hub, GHCR, etc.)

```bash
# Docker Hub
docker login
docker tag assetflow-monolith:v1.0.0 seu-usuario/assetflow-monolith:v1.0.0
docker push seu-usuario/assetflow-monolith:v1.0.0

# GitHub Container Registry (GHCR)
docker login ghcr.io
docker tag assetflow-monolith:v1.0.0 ghcr.io/seu-usuario/assetflow-monolith:v1.0.0
docker push ghcr.io/seu-usuario/assetflow-monolith:v1.0.0
```

## 3. Deploy no Railway

### 3.1 Preparar projeto

1. Faça push do código para GitHub
2. Acesse [railway.app](https://railway.app)
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Conecte seu repositório

### 3.2 Configurar build

- Railway detectará o `Dockerfile.monolith` automaticamente
- Se não, especifique manualmente em Settings → Build

### 3.3 Adicionar PostgreSQL

1. Em "Add Services", selecione "PostgreSQL"
2. Railway criará automaticamente a variável `DATABASE_URL`

### 3.4 Configurar variáveis de ambiente

Acesse Variables e adicione:
```
JWT_SECRET=production-secret-key-muito-seguro
DISABLE_RABBITMQ=true
NODE_ENV=production
```

### 3.5 Deploy

- Railway fará build e deploy automaticamente
- Acessar via URL fornecida (ex: `https://assetflow-monolith-production.railway.app`)

## 4. Deploy no Fly.io

### 4.1 Instalar flyctl

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows (via scoop ou chocolatey)
scoop install flyctl
```

### 4.2 Autenticar

```bash
flyctl auth signup  # ou flyctl auth login
```

### 4.3 Preparar aplicação

```bash
flyctl launch
```

Responda às perguntas:
- Nome da aplicação
- Selecione região
- Escolha "Yes" para PostgreSQL add-on

### 4.4 Configurar fly.toml

```toml
app = "assetflow-monolith"
primary_region = "gig"

[env]
  DATABASE_URL = "..." # Fly adiciona automaticamente

[build]
  dockerfile = "Dockerfile.monolith"

[[services]]
  protocol = "tcp"
  internal_port = 10000
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[deploy]
  strategy = "rolling"
```

### 4.5 Adicionar secrets

```bash
flyctl secrets set \
  JWT_SECRET="production-secret-key-muito-seguro" \
  DISABLE_RABBITMQ="true" \
  NODE_ENV="production"
```

### 4.6 Deploy

```bash
flyctl deploy
```

## 5. Deploy no Render

### 5.1 Conectar repositório

1. Acesse [render.com](https://render.com)
2. Clique em "New +"
3. Selecione "Web Service"
4. Conecte seu repositório GitHub

### 5.2 Configurar serviço

- **Name**: assetflow-monolith
- **Environment**: Docker
- **Dockerfile Path**: `Dockerfile.monolith`
- **Region**: Seu preferido

### 5.3 Adicionar banco PostgreSQL

1. Clique em "New"
2. Selecione "PostgreSQL"
3. Render criará automaticamente a variável `DATABASE_URL`

### 5.4 Configurar variáveis

Na aba "Environment":
```
JWT_SECRET=production-secret-key-muito-seguro
DISABLE_RABBITMQ=true
NODE_ENV=production
```

### 5.5 Deploy

- Clique em "Create Web Service"
- Render fará build e deploy automaticamente

## 6. Verificação Pós-Deploy

Após deploy em qualquer plataforma, valide:

```bash
# URL do seu app (substitua pela sua URL real)
APP_URL="https://seu-app-url.railway.app"

# 1. Health check
curl $APP_URL/health

# 2. Registrar novo usuário
REGISTER_RESPONSE=$(curl -X POST $APP_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@prod.com","password":"SecurePassword123"}')
echo $REGISTER_RESPONSE

# 3. Extrair token
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 4. Listar usuários
curl $APP_URL/users \
  -H "Authorization: Bearer $TOKEN"

# 5. Criar ativo
curl -X POST $APP_URL/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Servidor Dell","type":"Equipamento","status":"disponivel"}'

# 6. Listar ativos
curl $APP_URL/assets \
  -H "Authorization: Bearer $TOKEN"
```

## 7. Monitoramento e Logs

### Railway
- Acesse a aplicação em Dashboard
- Logs em tempo real na aba "Logs"

### Fly.io
```bash
flyctl logs
```

### Render
- Acesse sua aplicação em Dashboard
- Logs em "Logs" na sidebar

## 8. Troubleshooting

### Erro: "Connection refused on database"
- Verifique se o add-on PostgreSQL está ativo
- Confirme as credenciais
- Use `DATABASE_URL` se disponível

### Erro: "Port 10000 not accessible"
- Verifique se a porta 10000 está exposta na configuração
- Railway/Fly.io mapeiam automaticamente para portas padrão

### Build falha
- Verifique se `npm install` funciona localmente
- Valide `tsconfig.json`
- Confirme que `npm run build` compila sem erros

## 9. Estratégia de Rollback

### Railway / Render
- Ambas mantêm histórico de builds
- Selecione a versão anterior na aba de deployments

### Fly.io
```bash
flyctl releases list
flyctl releases rollback
```

## Recursos Adicionais

- [Railway Docs](https://docs.railway.app)
- [Fly.io Docs](https://fly.io/docs)
- [Render Docs](https://render.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices)
