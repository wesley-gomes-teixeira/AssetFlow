# AssetFlow Monolith

Aplicação monolítica consolidada de gerenciamento de ativos, substituindo a arquitetura de microserviços anterior.

## Estrutura do Projeto

```
src/
├── app.ts                           # Aplicação Express (rotas, middlewares globais)
├── server.ts                        # Entry point que inicia o servidor
├── types.ts                         # Type definitions (User, Asset, Ticket, etc.)
├── globals.d.ts                     # Declarações globais
├── config/
│   ├── db.ts                        # Configuração de conexão PostgreSQL (consolidada)
│   └── rabbitmq.ts                  # RabbitMQ (se necessário)
├── controllers/
│   ├── authController.ts            # Autenticação/Login/Registro
│   ├── userController.ts            # CRUD de usuários
│   ├── assetController.ts           # CRUD de ativos
│   └── ticketController.ts          # CRUD de chamados
├── middlewares/
│   ├── authMiddleware.ts            # Validação de JWT
│   ├── authorizationMiddleware.ts   # Autorização por role
│   └── businessRulesMiddleware.ts   # Validações de negócio
├── models/
│   ├── userModel.ts                 # Queries de usuários
│   ├── assetModel.ts                # Queries de ativos
│   └── ticketModel.ts               # Queries de chamados
└── routes/
    └── index.ts                     # Registro de todas as rotas
```

## Instalação e Execução Local

### Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL rodando localmente ou acesso a um banco remoto
- npm ou yarn

### Setup

1. **Instalar dependências:**
```bash
npm install
```

2. **Compilar TypeScript:**
```bash
npm run build
```

3. **Executar com variáveis de ambiente:**
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=yourpassword
export DB_NAME=assetflow
export JWT_SECRET=your-secret-key
export PORT=10000
npm start
```

Ou, para desenvolvimento com `ts-node`:
```bash
npm run dev
```

## Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login

### Usuários (requer autenticação)
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário (admin apenas)
- `GET /users/:id` - Buscar usuário por ID
- `PUT /users/:id` - Atualizar usuário (admin apenas)
- `DELETE /users/:id` - Deletar usuário (admin apenas)

### Ativos (requer autenticação)
- `GET /assets` - Listar ativos
- `POST /assets` - Criar ativo (admin/analyst)
- `GET /assets/:id` - Buscar ativo por ID
- `PUT /assets/:id` - Atualizar ativo (admin/analyst)
- `DELETE /assets/:id` - Deletar ativo (admin/analyst)

### Chamados (requer autenticação)
- `GET /tickets` - Listar chamados
- `POST /tickets` - Criar chamado (qualquer usuário autenticado)
- `GET /tickets/:id` - Buscar chamado por ID
- `PUT /tickets/:id` - Atualizar chamado (admin/analyst)
- `DELETE /tickets/:id` - Deletar chamado (admin/analyst)
- `PATCH /tickets/:id/status` - Atualizar status do chamado (admin/analyst)

## Docker

### Build da imagem

```bash
docker build -f Dockerfile.monolith -t assetflow-monolith:latest .
```

### Executar container

```bash
docker run --rm -p 10000:10000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=yourpassword \
  -e DB_NAME=assetflow \
  -e JWT_SECRET=your-secret-key \
  assetflow-monolith:latest
```

### Com docker-compose

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.monolith
    ports:
      - "10000:10000"
    env_file:
      - .env
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: assetflow
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  db-data:
```

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| PORT | 10000 | Porta de execução |
| DB_HOST | localhost | Host do PostgreSQL |
| DB_PORT | 5432 | Porta do PostgreSQL |
| DB_USER | postgres | Usuário do PostgreSQL |
| DB_PASSWORD | postgres | Senha do PostgreSQL |
| DB_NAME | assetflow | Nome do banco de dados |
| DATABASE_URL | - | URL de conexão Postgres (prioritária) |
| JWT_SECRET | assetflow-secret | Chave de assinatura de JWT |
| DISABLE_RABBITMQ | true | Desabilitar RabbitMQ (padrão no monolito) |

## Migração de Microserviços para Monolito

Os 5 microserviços anteriores foram consolidados:
- `gateway-service` → Controllers de auth + Middlewares de autorização
- `users-service` → `userController.ts` + `userModel.ts`
- `assets-service` → `assetController.ts` + `assetModel.ts`
- `tickets-service` → `ticketController.ts` + `ticketModel.ts`
- `frontend-service` → Servido estaticamente (ajustar conforme necessário)

## Deployment

### Railway
1. Conecte o repositório ao Railway
2. Configure as variáveis de ambiente
3. Aponte o `Dockerfile` para `Dockerfile.monolith`
4. Deploy automático

### Fly.io
1. Instale o `flyctl`
2. Execute `flyctl launch`
3. Configure `fly.toml` com as variáveis de ambiente
4. Execute `flyctl deploy`

## Logs e Debugging

Ao iniciar, o serviço imprime:
```
════════════════════════════════════════════
  AssetFlow Monolito
════════════════════════════════════════════
✓ AssetFlow Monolito rodando em http://localhost:10000
✓ Endpoints disponíveis:
  - GET  /health
  - POST /auth/register
  ...
```

## Troubleshooting

### Erro: "Banco de dados conectando..."
- Verifique se PostgreSQL está rodando
- Confirme as credenciais em `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Use `DATABASE_URL` para priorizar a string de conexão

### Erro: "Token invalido"
- Verifique se `JWT_SECRET` é o mesmo entre encode e decode
- Verifique o tempo de expiração do token (padrão: 8h)

### Erro de permissão
- Verifique o `role` do usuário (admin/analyst/user)
- Use `POST /auth/login` para obter um token válido
- Inclua o token no header `Authorization: Bearer <token>`
