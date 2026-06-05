# AssetFlow - Microservices Architecture

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Sistema de Gestão de Ativos de TI com Arquitetura de Microserviços**

[Features](#features) • [Arquitetura](#arquitetura) • [Deploy](#-deploy-rápido-no-render) • [Documentação](#documentação)

</div>

---

## 🚀 Deploy Rápido no Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://dashboard.render.com/select-repo?name=teste-sd)

**Um clique para fazer deploy em produção!**

1. Clique no botão acima
2. Selecione o repositório
3. Render cria automaticamente:
   - ✅ Web Service com todos os microserviços
   - ✅ PostgreSQL Database
   - ✅ SSL/TLS automático
   - ✅ CI/CD integrado

👉 **[Guia de Deploy Completo](./RENDER_DEPLOY.md)** | **[Melhorias Implementadas](./CODE_IMPROVEMENTS.md)**

---

## 📋 Sobre

AssetFlow é um sistema backend desenvolvido em **Node.js** e **Express** para gerenciamento de ativos de TI. Implementa uma arquitetura de microserviços com comunicação assíncrona via RabbitMQ, banco de dados separado por domínio e um API Gateway centralizado.

O sistema foi otimizado para deploy em produção no **Render** com **Docker** e **GitHub Actions** para CI/CD.

## ✨ Features

- ✅ **Microserviços Independentes**: Users, Assets, Tickets com databases isolados
- ✅ **API Gateway**: Autenticação JWT e autorização baseada em roles
- ✅ **Frontend Web**: Interface para CRUD de usuários, ativos e chamados
- ✅ **Comunicação Assíncrona**: Event broker com RabbitMQ
- ✅ **Docker Compose**: Ambiente completo em um único comando
- ✅ **Render-Ready**: Deploy em produção com um click
- ✅ **CI/CD Automatizado**: GitHub Actions com build validation
- ✅ **TypeScript**: Type-safe em todos os serviços

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Service (8080)                  │
│                  Next Gen UI / React App                     │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│              API Gateway Service (3000)                      │
│          JWT Auth + Authorization + Rate Limiting            │
├─────────────┬──────────────────┬─────────────┬──────────────┤
│             │                  │             │              │
▼             ▼                  ▼             ▼              ▼
Users      Assets              Tickets      Frontend       Events
Service    Service             Service      Assets        (RabbitMQ)
(3001)     (3002)             (3003)       (8080)         (5672)
│          │                   │            │              │
▼          ▼                   ▼            ▼              ▼
[users]   [assets]           [tickets]   [static]      [Event Broker]
(PostgreSQL Database)
```

### Estrutura de Diretórios

```
.
├── users-service/           # Gestão de usuários
│   └── src/
│       ├── controllers/      # Lógica de negócio
│       ├── models/          # Modelos de dados
│       ├── routes/          # Definição de rotas
│       ├── config/          # Configurações
│       └── server.ts        # Entry point
│
├── assets-service/          # Gestão de ativos
│   └── src/ (estrutura similar)
│
├── tickets-service/         # Gestão de chamados
│   └── src/ (estrutura similar)
│
├── gateway-service/         # API Gateway
│   └── src/
│       ├── middlewares/      # Auth, Authorization
│       ├── controllers/
│       └── routes/
│
├── frontend-service/        # Interface web
│   ├── public/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.ts
│   └── server.ts
│
├── docker/
│   └── render/
│       └── start-web.sh     # Orchestration em produção
│
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD pipeline
│
├── docker-compose.yml       # Dev environment
├── render.yaml             # Production config
└── Dockerfile              # Multi-service image
```

## 🔧 Serviços

### Users Service

| Propriedade | Valor |
|:---|:---|
| **Porta** | 3001 |
| **Database** | assetflow |
| **Responsabilidade** | Gestão de usuários e perfis |
| **Eventos** | `user.created`, `user.updated`, `user.deleted` |

**Endpoints:**
```
GET    /users              # Listar usuários
POST   /users              # Criar usuário
PUT    /users/:id          # Atualizar usuário
DELETE /users/:id          # Deletar usuário
```

### Assets Service

| Propriedade | Valor |
|:---|:---|
| **Porta** | 3002 |
| **Database** | assetflow |
| **Responsabilidade** | Gestão de ativos de TI |
| **Eventos** | `asset.created`, `asset.updated`, `asset.deleted` |

**Endpoints:**
```
GET    /assets             # Listar ativos
POST   /assets             # Criar ativo
PUT    /assets/:id         # Atualizar ativo
DELETE /assets/:id         # Deletar ativo
```

### Tickets Service

| Propriedade | Valor |
|:---|:---|
| **Porta** | 3003 |
| **Database** | assetflow |
| **Responsabilidade** | Gestão de chamados/tickets |
| **Eventos** | `ticket.created`, `ticket.updated`, `ticket.resolved` |

**Endpoints:**
```
GET    /tickets            # Listar tickets
POST   /tickets            # Criar ticket
PUT    /tickets/:id        # Atualizar ticket
DELETE /tickets/:id        # Deletar ticket
```

### API Gateway

| Propriedade | Valor |
|:---|:---|
| **Porta** | 3000 |
| **Responsabilidade** | Roteamento, autenticação e autorização |
| **Padrão** | BFF (Backend for Frontend) |

**Funcionalidades:**
- 🔐 Autenticação com JWT
- 👥 Controle de acesso por roles (`admin`, `analyst`, `user`)
- 🔄 Roteamento para microserviços
- ⚡ Rate limiting

**Endpoints:**
```
POST   /auth/register      # Registrar novo usuário
POST   /auth/login         # Fazer login
GET    /api/users          # Listar usuários (protegido)
POST   /api/users          # Criar usuário (protegido)
PUT    /api/users/:id      # Atualizar usuário (protegido)
DELETE /api/users/:id      # Deletar usuário (protegido)
GET    /api/assets         # Listar ativos (protegido)
POST   /api/assets         # Criar ativo (protegido)
PUT    /api/assets/:id     # Atualizar ativo (protegido)
DELETE /api/assets/:id     # Deletar ativo (protegido)
GET    /api/tickets        # Listar tickets (protegido)
POST   /api/tickets        # Criar ticket (protegido)
PUT    /api/tickets/:id    # Atualizar ticket (protegido)
DELETE /api/tickets/:id    # Deletar ticket (protegido)
```

### Frontend Service

| Propriedade | Valor |
|:---|:---|
| **Porta** | 8080 (produção: 10000) |
| **Tipo** | SPA (Single Page Application) |
| **Funcionalidade** | Interface web para CRUD operations |

**Recursos:**
- 🎨 Dashboard responsivo
- 📱 Gerenciamento de usuários
- 📊 Gerenciamento de ativos
- 🎫 Gerenciamento de chamados
- 🔐 Autenticação integrada

## 🔐 Autenticação & Autorização

### JWT (JSON Web Tokens)

O sistema utiliza JWT para autenticação stateless:

```bash
# Registrar novo usuário
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha_segura_123",
  "role": "user"
}

# Fazer login
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha_segura_123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Roles & Permissões

| Papel | Usuários | Ativos | Chamados |
|:---|:---:|:---:|:---:|
| **admin** | CRUD | CRUD | CRUD |
| **analyst** | Ver | CRUD | CRUD |
| **user** | Ver | Ver | Criar |

**Usar Token:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Stack Tecnológico

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 16
- **ORM/Query Builder:** Knex.js / Raw SQL
- **Event Bus:** RabbitMQ (opcional)
- **Authentication:** JWT (Json Web Token)

### DevOps
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Deployment:** Render
- **Version Control:** Git & GitHub

### Frontend
- **Runtime:** Browser / Node.js
- **Type Safety:** TypeScript
- **Styling:** CSS3
- **Build:** TypeScript Compiler

## 🧪 Testing & Validação

### Pre-commit Validation
- ✅ TypeScript compilation check
- ✅ Dependency resolution

### CI Pipeline
```yaml
1. Code checkout
2. Dependency install (todos os serviços)
3. TypeScript build
4. Docker image build
5. Deploy trigger (se main branch)
```

## 📝 Documentação de API

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer {token}  # Exceto em /auth/register e /auth/login
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.
