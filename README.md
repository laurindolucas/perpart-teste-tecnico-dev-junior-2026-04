# Sistema de Gestão — Desafio Técnico PerPart

Sistema full stack com autenticação JWT, CRUD completo de Usuários, Produtos e Categorias, auditoria de ações e relatórios para administradores.

---

## Tecnologias

**Backend**
- NestJS + TypeScript
- TypeORM + PostgreSQL
- JWT (autenticação)
- Swagger (documentação)
- Multer (upload de arquivos)

**Frontend**
- Next.js 16 + TypeScript
- UIGovPE (@uigovpe/components)
- Axios

**Infra**
- Docker + Docker Compose
- PostgreSQL 15

---

## Como rodar o projeto

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [Node.js 20+](https://nodejs.org/) (apenas para rodar local sem Docker)
- [Git](https://git-scm.com/)

---

### Opção 1 — Rodar com Docker (recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO

# 2. Suba todos os serviços
docker compose up --build
```

Aguarde todos os containers subirem e acesse:

| Serviço    | URL                              |
|------------|----------------------------------|
| Frontend   | http://localhost:3000            |
| Backend    | http://localhost:3001            |
| Swagger    | http://localhost:3001/api/docs   |

---

### Opção 2 — Rodar localmente (sem Docker)

**Banco de dados (ainda usa Docker):**
```bash
docker compose up db -d
```

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## Usuário padrão

Crie o primeiro usuário admin via Swagger em `http://localhost:3001/api/docs`:

Depois promova para admin diretamente no banco ou via endpoint PUT /users/:id com `"role": "admin"`.

---

## Funcionalidades

### Usuário (USER)
- ✅ Login com JWT
- ✅ Cadastrar e visualizar Produtos
- ✅ Cadastrar e visualizar Categorias
- ✅ Favoritar N produtos
- ✅ Upload de imagem em produtos

### Administrador (ADMIN)
- ✅ Tudo do usuário comum
- ✅ CRUD completo de Usuários
- ✅ Dashboard com visão geral do sistema
- ✅ Relatórios de auditoria com filtro por data
- ✅ Upload de avatar em usuários

---

## Estrutura do Projeto

desafio-tecnico/
├── backend/
│   ├── src/
│   │   ├── auth/         # JWT, guards, estratégias
│   │   ├── users/        # CRUD de usuários
│   │   ├── products/     # CRUD de produtos
│   │   ├── categories/   # CRUD de categorias
│   │   ├── favorites/    # Sistema de favoritos
│   │   └── audit/        # Auditoria e relatórios
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/          # Páginas Next.js
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── contexts/     # Context API (Auth)
│   │   └── services/     # Axios (API)
│   ├── Dockerfile
│   └── .env.example
└── docker-compose.yml

---

## Documentação da API

Acesse o Swagger em: `http://localhost:3001/api/docs`

Principais endpoints:

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | /auth/register | Cadastrar usuário | ❌ |
| POST | /auth/login | Login | ❌ |
| GET | /users | Listar usuários | ADMIN |
| GET | /products | Listar produtos | ✅ |
| POST | /products | Criar produto | ✅ |
| GET | /categories | Listar categorias | ✅ |
| POST | /favorites/:id | Favoritar produto | ✅ |
| GET | /audit | Relatório de auditoria | ADMIN |

---

## Comandos Docker úteis

```bash
# Subir tudo
docker compose up --build

# Subir em background
docker compose up -d --build

# Parar tudo
docker compose down

# Resetar tudo (apaga dados do banco)
docker compose down -v

# Ver logs do backend
docker logs desafio_backend -f

# Ver logs do frontend
docker logs desafio_frontend -f

# Acessar o banco pelo terminal
docker exec -it desafio_db psql -U postgres -d desafio_db
```