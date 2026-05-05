# 📚 API Routes - AssetFlow

## Padrão de Versionamento
Todas as rotas seguem o padrão profissional:
- **Versão**: `/api/v1/`
- **Recursos em plural**: `/users`, `/assets`, `/tickets`
- **Autenticação**: Requerida para todas as rotas `/api/v1/` (exceto auth)

---

## 🔐 Autenticação

### Login
- **POST** `/auth/login`
  - Body: `{ email, password }`
  - Response: `{ id, name, email, role }`
  - Status: `200`

### Registro
- **POST** `/auth/register`
  - Body: `{ name, email, password }`
  - Role: Atribuído automaticamente (primeiro usuário = admin, demais = user)
  - Response: `{ id, name, email, role }`
  - Status: `201`

---

## 👥 Usuários

### Listar Usuários
- **GET** `/api/v1/users?page=1&limit=20`
  - Roles: `admin`, `analyst`, `user`
  - Query Params:
    - `page` (default: 1)
    - `limit` (default: 20, max: 100)
  - Status: `200`

### Criar Usuário
- **POST** `/api/v1/users`
  - Roles: `admin`
  - Body: `{ name, email, password, role }`
  - Status: `201`

### Buscar Usuário por ID
- **GET** `/api/v1/users/:id`
  - Roles: `admin`, `analyst`, `user`
  - Status: `200`

### Atualizar Usuário
- **PUT** `/api/v1/users/:id`
  - Roles: `admin`
  - Body: `{ name, email, role, password? }`
  - Status: `200`

### Deletar Usuário
- **DELETE** `/api/v1/users/:id`
  - Roles: `admin`
  - Validação: Não pode deletar se tem ativos atribuídos
  - Status: `200`

### Tickets do Usuário
- **GET** `/api/v1/users/:id/tickets`
  - Roles: `admin`, `analyst`, `user`
  - Status: `200`
  - ⚠️ Em desenvolvimento (integração com tickets-service)

### Ativos do Usuário
- **GET** `/api/v1/users/:id/assets`
  - Roles: `admin`, `analyst`, `user`
  - Status: `200`
  - ⚠️ Em desenvolvimento (integração com assets-service)

---

## 📦 Ativos

### Listar Ativos
- **GET** `/api/v1/assets?page=1&limit=20`
  - Roles: `admin`, `analyst`, `user`
  - Query Params:
    - `page` (default: 1)
    - `limit` (default: 20, max: 100)
  - Status: `200`

### Criar Ativo
- **POST** `/api/v1/assets`
  - Roles: `admin`, `analyst`
  - Body: `{ name, type, status, userId }`
  - Status: `201`

### Buscar Ativo por ID
- **GET** `/api/v1/assets/:id`
  - Roles: `admin`, `analyst`, `user`
  - Status: `200`

### Atualizar Ativo
- **PUT** `/api/v1/assets/:id`
  - Roles: `admin`, `analyst`
  - Body: `{ name, type, status, userId }`
  - Status: `200`

### Deletar Ativo
- **DELETE** `/api/v1/assets/:id`
  - Roles: `admin`, `analyst`
  - Validação: Não pode deletar se tem tickets abertos
  - Status: `200`

### Tickets do Ativo
- **GET** `/api/v1/assets/:id/tickets`
  - Roles: `admin`, `analyst`, `user`
  - Status: `200`
  - ⚠️ Em desenvolvimento (integração com tickets-service)

---

## 🎫 Chamados

### Listar Chamados
- **GET** `/api/v1/tickets?page=1&limit=20&status=open`
  - Roles: `admin`, `analyst`, `user`
  - Query Params:
    - `page` (default: 1)
    - `limit` (default: 20, max: 100)
    - `status` (open, closed, in-progress, on-hold)
  - Status: `200`

### Criar Chamado
- **POST** `/api/v1/tickets`
  - Roles: `admin`, `analyst`, `user`
  - Body: `{ title, description, status, assetId }`
  - Status: `201`

### Buscar Chamado por ID
- **GET** `/api/v1/tickets/:id`
  - Roles: `admin`, `analyst`, `user`
  - Status: `200`

### Atualizar Chamado
- **PUT** `/api/v1/tickets/:id`
  - Roles: `admin`, `analyst`
  - Body: `{ title, description, status, assetId }`
  - Status: `200`

### Deletar Chamado
- **DELETE** `/api/v1/tickets/:id`
  - Roles: `admin`, `analyst`
  - Status: `200`

### Atualizar Status do Chamado
- **PATCH** `/api/v1/tickets/:id/status`
  - Roles: `admin`, `analyst`
  - Body: `{ status }` (open, closed, in-progress, on-hold)
  - Status: `200`

### Atribuir Chamado
- **PATCH** `/api/v1/tickets/:id/assign`
  - Roles: `admin`, `analyst`
  - Body: `{ assignedTo }` (userId or null)
  - Status: `200`

---

## 🔧 Internas (Entre Serviços)

### Desassociar Ativos do Usuário
- **POST** `/internal/api/v1/users/:id/unassign-assets`
  - Body: (vazio)
  - Status: `200`

### Marcar Chamados sem Ativo
- **POST** `/internal/api/v1/assets/:assetId/mark-without-asset`
  - Body: (vazio)
  - Status: `200`

### Health Check
- **GET** `/internal/api/v1/health`
  - Response: `{ status: "ok", service: "service-name" }`
  - Status: `200`

---

## 📊 Estrutura de Resposta (Padrão)

### Sucesso
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "admin",
  "createdAt": "2026-05-05T10:30:00Z",
  "updatedAt": "2026-05-05T10:30:00Z"
}
```

### Erro
```json
{
  "message": "Mensagem de erro",
  "details": "Detalhes técnicos"
}
```

---

## 🚀 Filtros e Paginação

### Exemplo com Paginação
```bash
GET /api/v1/users?page=2&limit=50
```

### Exemplo com Filtros
```bash
GET /api/v1/tickets?page=1&limit=20&status=open
```

---

## ✅ Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro do servidor |

---

## 🔄 HTTP Métodos Semânticos

| Método | Uso |
|--------|-----|
| GET | Buscar/Listar recursos |
| POST | Criar novo recurso |
| PUT | Atualizar recurso completo |
| PATCH | Atualizar parcialmente |
| DELETE | Remover recurso |

---

## 🛡️ Autorizações

### Roles e Permissões

#### Admin
- ✅ Criar/Atualizar/Deletar usuários
- ✅ Criar/Atualizar/Deletar ativos
- ✅ Criar/Atualizar/Deletar chamados
- ✅ Visualizar tudo

#### Analyst
- ✅ Visualizar usuários
- ✅ Criar/Atualizar ativos
- ✅ Criar/Atualizar chamados
- ❌ Deletar usuários
- ❌ Deletar ativos críticos

#### User
- ✅ Visualizar usuários
- ✅ Criar/Visualizar chamados
- ❌ Deletar
- ❌ Atualizar status

---

## 📱 Exemplo de Uso

### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"senha123"}'
```

### 2. Listar Usuários (com token)
```bash
curl -X GET http://localhost:3000/api/v1/users?page=1&limit=20 \
  -H "Authorization: Bearer <token>"
```

### 3. Criar Ativo
```bash
curl -X POST http://localhost:3000/api/v1/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Laptop Dell","type":"hardware","status":"available","userId":1}'
```

### 4. Criar Chamado
```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Reparo necessário","description":"Teclado com problema","status":"open","assetId":1}'
```

---

## ⚠️ Notas Importantes

- Todas as rotas `/api/v1/` requerem autenticação via token JWT
- Rotas internas (`/internal/...`) não requerem autenticação (apenas entre serviços)
- Paginação padrão: 20 itens por página
- Máximo de itens por página: 100
- Timestamps em ISO 8601 (UTC)

