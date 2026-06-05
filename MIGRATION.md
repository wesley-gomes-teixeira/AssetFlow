# Transformação: Microserviços → Monolito

## Arquitetura Anterior (5 Microserviços)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE HTTP                                 │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │    GATEWAY SERVICE (Port 3000)  │
        ├────────────────────────────────┤
        │ • Auth Controller              │
        │ • Proxy Controller             │
        │ • Auth Middleware              │
        │ • Authorization Middleware      │
        └────────────┬─────────┬─────────┬────────────────┐
                     │         │         │                │
         ┌───────────▼─┐  ┌───▼──────┐ ┌─▼────────┐  ┌──▼────────┐
         │ USERS SVC   │  │ ASSETS   │ │ TICKETS  │  │ FRONTEND  │
         │ (Port 3001) │  │ SVC      │ │ SVC      │  │ (Port:...)│
         │             │  │ (3002)   │ │ (3003)   │  │           │
         │ • Users     │  │          │ │          │  │ • UI      │
         │ • Auth      │  │ • Assets │ │ • Tickets│  │           │
         │ • DB        │  │ • DB     │ │ • DB     │  │ • Serve   │
         └──────────────  └──────────┘ └──────────┘  └───────────┘
             ▲
             └──────────── SQL Queries ─────────────┐
                                                     ▼
                                         ┌────────────────────────┐
                                         │   PostgreSQL (1 DB)    │
                                         │   5 Schemas separados  │
                                         └────────────────────────┘
```

### Problemas da arquitetura anterior:
- ❌ 5 processos Node rodando independentemente
- ❌ Comunicação via HTTP entre serviços (lentidão)
- ❌ Overhead de deploy (5 Dockerfiles, 5 containers)
- ❌ Complexidade de orquestração
- ❌ Múltiplas tabelas de usuários (users_db, assets_db, tickets_db)
- ❌ Dificuldade para manter sincronização entre serviços

## Arquitetura Nova (Monolito)

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE HTTP                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────────────────┐
    │        ASSETFLOW MONOLITH (Port 10000)               │
    ├──────────────────────────────────────────────────────┤
    │  Express App (src/app.ts)                            │
    ├──────────────────────────────────────────────────────┤
    │ • CORS Middleware                                    │
    │ • Authentication Middleware (JWT)                    │
    │ • Authorization Middleware (Roles)                   │
    │ • Business Rules Middleware                          │
    ├──────────────────────────────────────────────────────┤
    │ ROTAS (src/routes/index.ts)                         │
    │ ┌────────────────────────────────────────────────┐  │
    │ │ POST   /auth/register                          │  │
    │ │ POST   /auth/login                             │  │
    │ │ GET    /users                                  │  │
    │ │ POST   /users                                  │  │
    │ │ GET    /assets                                 │  │
    │ │ POST   /assets                                 │  │
    │ │ GET    /tickets                                │  │
    │ │ POST   /tickets                                │  │
    │ └────────────────────────────────────────────────┘  │
    ├──────────────────────────────────────────────────────┤
    │ CONTROLLERS (Lógica de Negócio)                     │
    │ • authController.ts                                  │
    │ • userController.ts                                  │
    │ • assetController.ts                                 │
    │ • ticketController.ts                                │
    ├──────────────────────────────────────────────────────┤
    │ MODELS (Data Access Layer)                          │
    │ • userModel.ts (SELECT, INSERT, UPDATE, DELETE)     │
    │ • assetModel.ts (SELECT, INSERT, UPDATE, DELETE)    │
    │ • ticketModel.ts (SELECT, INSERT, UPDATE, DELETE)   │
    ├──────────────────────────────────────────────────────┤
    │ DATABASE CONNECTION (src/config/db.ts)              │
    │ • Pool de conexões PostgreSQL                       │
    │ • Auto-inicialização de schema                      │
    └──────────────────────────────────────────────────────┘
                       │
                       ▼
            ┌────────────────────────┐
            │   PostgreSQL (1 DB)    │
            │  • users table         │
            │  • assets table        │
            │  • tickets table       │
            └────────────────────────┘
```

### Benefícios do monolito:
- ✅ 1 processo Node único
- ✅ Chamadas de função diretas (sem HTTP)
- ✅ 1 Dockerfile, 1 container
- ✅ Deploy simplificado
- ✅ Schema PostgreSQL unificado
- ✅ Transações ACID garantidas
- ✅ Mais rápido e eficiente
- ✅ Debugging mais fácil
- ✅ Redução de latência

## Consolidação de Código

### Antes (5 Microsserviços)
```
gateway-service/
├── Dockerfile
├── package.json
├── tsconfig.json
└── src/
    ├── app.ts
    ├── server.ts
    ├── controllers/ (auth, proxy)
    ├── middlewares/
    └── routes/

users-service/
├── Dockerfile
├── package.json
└── src/
    ├── models/ (userModel)
    ├── controllers/ (userController)
    ├── routes/
    └── config/

... 3 serviços adicionais
```

**Total: ~1500+ linhas de código distribuído**

### Depois (Monolito)
```
src/
├── app.ts                           (Express app único)
├── server.ts                        (Entry point)
├── types.ts                         (Type definitions)
├── config/
│   └── db.ts                        (1 pool PostgreSQL)
├── controllers/
│   ├── authController.ts
│   ├── userController.ts
│   ├── assetController.ts
│   └── ticketController.ts
├── models/
│   ├── userModel.ts
│   ├── assetModel.ts
│   └── ticketModel.ts
├── middlewares/
│   ├── authMiddleware.ts
│   ├── authorizationMiddleware.ts
│   └── businessRulesMiddleware.ts
├── routes/
│   └── index.ts                     (Todas as rotas)
└── globals.d.ts

Dockerfile.monolith                  (Build único)
package.json                         (Deps únicas)
tsconfig.json                        (Config única)
```

**Total: ~1200 linhas, mais limpo e organizado**

## Tabelas do Banco de Dados Unificadas

### Antes (Separadas por serviço)
```sql
-- users-service
CREATE TABLE users_db.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150),
  ...
);

-- assets-service
CREATE TABLE assets_db.assets (
  id SERIAL PRIMARY KEY,
  ...
);

-- tickets-service
CREATE TABLE tickets_db.tickets (
  id SERIAL PRIMARY KEY,
  ...
);
```

### Depois (Unificadas)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150),
  password VARCHAR(255),
  role VARCHAR(30),
);

CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  type VARCHAR(100),
  status VARCHAR(100),
  "userId" INTEGER REFERENCES users(id),
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150),
  description TEXT,
  status VARCHAR(100),
  "assetId" INTEGER REFERENCES assets(id),
);
```

## Próximos Passos

1. ✅ **Estrutura consolidada** - Feito
2. ✅ **Controllers e Models** - Feito
3. ✅ **Middlewares de autenticação/autorização** - Feito
4. ✅ **Rotas unificadas** - Feito
5. ✅ **Package.json e TypeScript config** - Feito
6. ⏭️ **Testes** - Rodando `npm install` e `npm run build`
7. ⏭️ **Deploy** - Railway, Fly.io, Render, etc.
8. ⏭️ **CI/CD** - GitHub Actions para build/push

## Checklist de Execução

- [ ] `npm install` - Instalar dependências
- [ ] `npm run build` - Compilar TypeScript
- [ ] `npm start` - Rodar localmente e validar endpoints
- [ ] Testar auth: `/auth/register`, `/auth/login`
- [ ] Testar CRUD: `/users`, `/assets`, `/tickets`
- [ ] `docker build -f Dockerfile.monolith -t assetflow-monolith .`
- [ ] `docker run --rm -p 10000:10000 assetflow-monolith`
- [ ] Deploy em Railway/Fly.io/Render

## Recursos

- 📖 [MONOLITH.md](./MONOLITH.md) - Documentação do monolito
- 🚀 [DEPLOY.md](./DEPLOY.md) - Guia de deployment
- 📝 [.env.example](./.env.example) - Variáveis de ambiente
