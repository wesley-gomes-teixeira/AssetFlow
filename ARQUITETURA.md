# 📐 ARQUITETURA - AssetFlow

**Data:** 28 de março de 2026  
**Versão:** 2.0  
**Status:** ✅ Atualizado para Deploy em Produção

> 📚 **Para informações sobre instalação, deployment e uso**, consulte [README.md](README.md)

---

## 📋 INFORMAÇÕES GERAIS

### Nome do Sistema
**AssetFlow** - Sistema de Gestão de Ativos de TI com Arquitetura de Microserviços

### Tema
Controle de Estoque / Gestão de Ativos de TI

Sistema distribuído para gerenciar computadores, equipamentos e suportes técnicos de uma empresa, otimizado para escalabilidade e tolerância a falhas.

---

## 🎯 OBJETIVO E FUNCIONALIDADES

### Objetivo do Sistema
Gerenciar e controlar os ativos de TI de uma organização através de uma arquitetura de microserviços escalável, com comunicação assíncrona e isolamento de dados por domínio.

### Funcionalidades Principais (detalhes em README.md)

- **Gestão de Usuários**: Cadastro, autenticação JWT, atualização e remoção
- **Gestão de Ativos**: CRUD completo de ativos de TI com vinculação a usuários
- **Gestão de Chamados**: Registro e gerenciamento de tickets técnicos
- **Autenticação**: Login seguro com JWT no API Gateway
- **Sincronização**: Eventos assíncronos entre serviços via RabbitMQ
- **API Gateway**: Centralização de requisições com autorização por roles

---

## 🛠️ DECISÕES TECNOLÓGICAS

### Stack Selecionado

| Componente | Escolha | Justificativa |
|-----------|---------|---------------|
| **Runtime** | Node.js 20 | Assíncrono, event-driven, ideal para I/O |
| **Framework** | Express.js | Leve, flexível e maduro |
| **Linguagem** | TypeScript | Type-safety, melhor developer experience |
| **Database** | PostgreSQL 16 | ACID, confiável, escalável |
| **Message Broker** | RabbitMQ | Fila persistente, consumer groups, routing |
| **Containerização** | Docker + Compose | Ambiente consistente dev/prod |
| **Autenticação** | JWT | Stateless, escalável, seguro |

> Para stack completo, ver [README.md - Stack Tecnológico](README.md#-stack-tecnológico)

---

## 🏗️ PADRÃO DE ARQUITETURA

### Estilo Arquitetural: Microserviços

**Escolha:** Cada domínio (Users, Assets, Tickets) é um serviço independente com:
- ✅ Database isolado (Database per Service pattern)
- ✅ Deploy independente
- ✅ Stack tecnológico padronizado
- ✅ Comunicação via Gateway (síncrona) + RabbitMQ (assíncrona)

**Benefícios:**
- Escalabilidade seletiva (aumentar replicas de um serviço)
- Tolerância a falhas (falha em um não afeta outros)
- Separação de responsabilidades clara
- Facilita onboarding de novos desenvolvedores

### Padrões de Design Aplicados

| Padrão | Onde | Propósito |
|--------|------|----------|
| **API Gateway** | gateway-service | Roteamento, autenticação centralizada, rate limiting |
| **Database per Service** | users, assets, tickets | Evitar acoplamento de dados |
| **Event Sourcing** (básico) | RabbitMQ consumers | Sincronização eventual entre domínios |
| **Bulkhead Pattern** | Containers isolados | Falha em um serviço não derruba infra toda |
| **Retry Pattern** | RabbitMQ consumers | Resiliência em falhas transientes |
| **Circuit Breaker** | (futuro) | Prevenir cascata de falhas |

---

## 🔌 COMUNICAÇÃO INTER-SERVIÇOS

### Padrão Síncrono: REST via Gateway

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌──────────────────────┐
│  API Gateway (3000)  │◄── JWT Validation
│  Multiplexer        │
└──┬────────┬────────┬─┘
   │        │        │
   ▼        ▼        ▼
 Users   Assets    Tickets
(3001)  (3002)    (3003)
```

**Quando usar:**
- Requisições síncronas (cliente espera resposta)
- Operações que precisam suceder atomicamente
- Queries diretas para dados

### Padrão Assíncrono: Event Sourcing via RabbitMQ

```
┌─────────────────────┐
│  Users Service      │
│  (publica evento)   │
└──────────┬──────────┘
           │ user.deleted
           ▼
      ┌─────────┐
      │RabbitMQ │ (durable queues)
      │Exchange │
      └────┬────┘
           │
        ┌──┴──┐
        │     │
        ▼     ▼
      Assets Tickets
      Service Service
      (consume)
```

**Fluxo de Evento - Exemplo: Deletar Usuário**

```
1. DELETE /api/users/5
   ├─ Gateway autentica
   └─ Roteia para Users Service

2. Users Service processa
   ├─ Valida dados
   ├─ Remove do banco
   └─ Publica evento "user.deleted"

3. RabbitMQ recebe
   ├─ Armazena em fila persistente
   └─ Notifica consumers

4. Assets Service consome
   ├─ Busca todos ativos com owner_id=5
   └─ SET owner_id=NULL para todos

5. Tickets Service consome
   ├─ Pode também reag ir (lógica de negócio)
```

**Eventos Implementados:**

| Evento | Publisher | Subscribers | Ação |
|--------|-----------|------------|------|
| `user.deleted` | Users | Assets, Tickets | Desvincula recursos do usuário |
| `asset.updated` | Assets | Tickets | Sincroniza dados de ativo |

**Quando usar:**
- Efeitos colaterais (cascata de updates)
- Operações que podem ser assíncronas
- Reduzir latência da resposta HTTP

---

## 🔐 SEGURANÇA

### Autenticação JWT

**Fluxo:**

```
1. POST /auth/register
   └─ Cria usuário, retorna token

2. POST /auth/login
   ├─ Valida credenciais
   └─ Gera JWT com payload:
      {
        "iat": 1234567890,
        "sub": "user_id",
        "role": "admin|analyst|user"
      }

3. Cliente armazena token (localStorage/sessionStorage)

4. Próximas requisições
   ├─ Header: Authorization: Bearer {token}
   ├─ Middleware authMiddleware valida
   ├─ Extrai sub (user_id) e role
   └─ Aplica regras de autorização
```

### Controle de Acesso (RBAC)

```javascript
// Exemplo de autorização no Gateway

const roles = {
  admin: ["GET /api/*", "POST /api/*", "PUT /api/*", "DELETE /api/*"],
  analyst: ["GET /api/*", "POST /api/*", "PUT /api/*"],
  user: ["GET /api/*", "POST /api/tickets"]
};
```

### Isolamento de Dados

- Cada serviço tem seu PostgreSQL
- Credenciais via variáveis de ambiente
- RabbitMQ com autenticação (produção)
- CORS configurado em produção

---

## 📊 FLUXOS CRÍTICOS

### Fluxo 1: Autenticação (Login)

```
Frontend                          Gateway                    Users Service
   │                               │                              │
   ├─ POST /auth/login ────────→  │                              │
   │   {email, password}           │                              │
   │                        ├─ Parse JSON                         │
   │                        │                              ├─ Query users
   │                        │                              │  WHERE email=?
   │                        │                    ├─ Hash password
   │                        │                    │  Compare com DB
   │                        │                    │
   │                        │◄─ User found, valid
   │                        ├─ Generate JWT
   │                        │  (signing com SECRET)
   │◄─ {token, user} ───────┤
   │                        └─ Set-Cookie (opcional)
   │
   ├─ Armazena token
   │
   └─ Próximas requisições com Authorization header
```

### Fluxo 2: Cascata de Deletes com RabbitMQ

```
DELETE /api/users/42
   │
   ├─ authMiddleware valida JWT
   ├─ userController.deleteUser(42)
   │
   ├─ DELETE users WHERE id=42
   │
   ├─ Publica em RabbitMQ:
   │  {
   │    "event": "user.deleted",
   │    "data": {id: 42, name: "John", email: "john@example.com"}
   │  }
   │
   └─ RabbitMQ (durable: true, autoAck: false)
      │
      ├─ Assets Consumer recebe
      │  └─ UPDATE assets SET owner_id=NULL WHERE owner_id=42
      │
      └─ Tickets Consumer recebe
         └─ (lógica customizada se necessário)
```

### Fluxo 3: Requisição Autenticada com Falha

```
GET /api/users com token expirado
   │
   ├─ authMiddleware.verifyToken(token)
   │  └─ jwt.verify() lança erro
   │
   ├─ Error Handler captura
   │  {
   │    "success": false,
   │    "error": "Token expired",
   │    "code": "TOKEN_EXPIRED"
   │  }
   │
   └─ HTTP 401 Unauthorized
      └─ Cliente redireciona para login
```

---

## 📂 ESTRUTURA DE CÓDIGO

> Para estrutura de diretórios completa, ver [README.md - Estrutura de Diretórios](README.md#estrutura-de-diretórios)

### Padrão de Organização por Serviço

Cada microserviço segue a mesma estrutura:

```
{service}/
├── src/
│   ├── app.ts              # Configuração Express
│   ├── server.ts           # Inicialização & port listening
│   ├── controllers/        # Lógica de negócio
│   ├── models/             # Acesso a dados (SQL queries)
│   ├── routes/             # Definição de endpoints
│   ├── config/             # Configurações (DB, RabbitMQ)
│   ├── consumers/          # (opcional) Event handlers
│   ├── types.ts            # Tipos TypeScript
│   └── globals.d.ts        # Declarações globais
├── Dockerfile              # Container definition
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

### Separação de Responsabilidades

**Controllers:** Lidam com HTTP
- Recebem request
- Validam entrada
- Chamam models
- Enviam response

**Models:** Acesso a dados
- Queries SQL diretas ou via query builder
- Abstração de banco de dados
- Transações

**Routes:** Mapeiam endpoints
- Define GET, POST, PUT, DELETE
- Aplica middlewares
- Conecta controller

---

## 🐳 INFRAESTRUTURA

### Docker Compose (Desenvolvimento)

Orquestra 9 serviços:

```
Services:
├── rabbitmq          # Message broker (5672 AMQP, 15672 UI)
├── postgres          # Banco único (para dev/produção Render)
│
├── gateway-service   # API Gateway (3000)
├── users-service     # Microserviço (3001)
├── assets-service    # Microserviço (3002)
├── tickets-service   # Microserviço (3003)
└── frontend-service  # Web UI (8080 local, 10000 produção)
```

**Para iniciar:** `docker compose up --build`

### Render (Produção)

- **Web Service:** Runs Dockerfile multi-serviço
- **PostgreSQL:** Managed database (créditos pagos)
- **Variáveis de Ambiente:** Configuradas via dashboard
- **Deploy Hook:** GitHub Actions trigger Render redeploy

---

## 💾 MODELO DE DADOS

### PostgreSQL - Single Database (Produção)

```sql
-- Todos os serviços compartilham um banco em produção
-- Database: assetflow

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- admin, analyst, user
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, retired
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, closed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
---

---

## 🔧 DECISÕES DE DESIGN E TRADE-OFFS

### 1. Database per Service vs. Shared Database

**Escolha:** Database per Service (isolado por domínio em dev, único em prod)

| Aspecto | Database per Service | Shared Database |
|--------|----------------------|-----------------|
| Escalabilidade | ✅ Melhor | ❌ Limitada |
| Autonomia | ✅ Completa | ❌ Acoplada |
| Backup | ✅ Independente | ❌ Monolítico |
| Queries Juntas | ❌ Impossível | ✅ Fácil |
| Complexidade | ❌ Mais complexa | ✅ Simples |

**Implementação:** Em desenvolvimento cada serviço tem seu DB. Em produção (Render) usamos um único PostgreSQL compartilhado para reduzir custos.

### 2. REST Síncrono vs. Async-Only

**Escolha:** Híbrido - Síncrono para requisições client, Assíncrono para cascatas

**Motivo:**
- REST simples, bem compreendido, ideal para CRUD
- RabbitMQ para side-effects (deletes em cascata, sincronização)
- Reduz latência de resposta (não aguarda consumers)

### 3. API Gateway vs. Service-to-Service

**Escolha:** Sempre através do Gateway para clients externos

**Benefícios:**
- Ponto único de autenticação
- Rate limiting centralizado
- CORS gerenciado em um lugar
- Abstrai topologia interna

**Interno:** Serviços podem se comunicar direto (otimização futura)

### 4. JWT sem Refresh Token (v1)

**Decisão:** Token longa vida, sem refresh (simplificar v1)

**Futuro:**
- Access token (15 min) + Refresh token (7 dias)
- Blacklist de tokens revogados

---

## 📈 ESCALABILIDADE

### Horizontal Scaling

```
Com Docker Compose (DEV):
┌─ assetflow (1 instância)
│   └─ gateway-service
│   └─ users-service
│   └─ assets-service
│   └─ tickets-service
│   └─ frontend-service

Com Render (PROD):
┌─ assetflow (N instâncias possíveis)
│   └─ cada instância roda os 5 serviços
│   └─ load balancer automático Render
```

---

### Métricas

```
Atual: Sem coleta
Futuro:
├─ Prometheus (coleta)
├─ Grafana (dashboard)
└─ Alertas automáticos
```
---

## 🔐 MATRIZ DE SEGURANÇA

| Aspecto | Status | Notas |
|--------|--------|-------|
| HTTPS | ❌ Dev | ✅ Render com TLS automático |
| Validação de Entrada | ⏳ Parcial | Adicionar zod/joi |
| SQL Injection | ✅ Safe | Parameterized queries |
| CORS | ✅ Sim | Configurado |
| JWT | ✅ Sim | HS256 |
| Rate Limiting | ⏳ Futuro | express-rate-limit |
| OWASP | ⏳ Melhorar | helmet.js, sanitization |

---

## 📚 ARQUIVOS IMPORTANTES

| Arquivo | Propósito |
|---------|-----------|
| [README.md](README.md) | Guia de uso, instalação, deploy |
| [ARQUITETURA.md](ARQUITETURA.md) | Este documento - decisões técnicas |
| [docker-compose.yml](docker-compose.yml) | Orquestração dev |
| [Dockerfile](Dockerfile) | Build multi-serviço |
| [render.yaml](render.yaml) | Config deploy produção |
| [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | CI/CD automation |

---

## 🔄 EVOLUÇÃO DA ARQUITETURA

### V1.0 (Atual)
- ✅ Microserviços básicos com REST
- ✅ RabbitMQ para eventos
- ✅ Autenticação JWT simples
- ✅ Docker Compose
- ✅ Deploy Render

### V1.5 (Próxima)
- ⏳ GraphQL como alternativa a REST
- ⏳ Refresh tokens
- ⏳ Rate limiting
- ⏳ Swagger/OpenAPI docs

### V2.0 (Futuro)
- ⏳ Kubernetes
- ⏳ Service mesh (Istio)
- ⏳ Observability completa (ELK + Prometheus + Jaeger)
- ⏳ CQRS (Command Query Responsibility Segregation)
- ⏳ Event sourcing completo
