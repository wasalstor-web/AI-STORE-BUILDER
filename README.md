# AI Store Builder

> **Full-stack AI-powered e-commerce builder  from idea to live store in minutes.**

[![CI](https://github.com/wasalstor-web/AI-STORE-BUILDER/actions/workflows/ci.yml/badge.svg)](https://github.com/wasalstor-web/AI-STORE-BUILDER/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## What is this?

An AI-powered platform for building Arabic-first e-commerce stores. Users describe what they want in plain Arabic, and the AI + template engine generates a full storefront  instantly.

**Key highlights:**
- **12 professional templates** covering fashion, electronics, beauty, food, jewelry, sports, and more
- **21+ drag-and-drop sections** (hero, products, testimonials, FAQ, countdown, gallery, etc.)
- **AI chat builder**  tell the AI what to change and watch it rebuild your store live
- **Multi-tenant architecture**  each user gets isolated data
- **Full RTL Arabic UI** with dark theme

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| **Frontend** | React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4 |
| **Database** | PostgreSQL 16 (prod) / SQLite (dev) |
| **Cache & Queue** | Redis 7 + ARQ |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **AI** | OpenAI GPT (with local fallback) |
| **Infra** | Docker Compose, GitHub Actions CI |

---

## Quick Start

### Option A: Docker (recommended)

```bash
git clone https://github.com/wasalstor-web/AI-STORE-BUILDER.git
cd AI-STORE-BUILDER
cp .env.example .env
docker compose up --build -d
```

Open http://localhost:8000/docs for API, http://localhost:3000 for frontend.

### Option B: Local development

```bash
# Backend
cd AI-STORE-BUILDER
pip install uv
uv pip install --system -r pyproject.toml
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
AI-STORE-BUILDER/
+-- app/                        # Backend (FastAPI)
|   +-- api/                    # Route handlers
|   |   +-- auth.py             #   Authentication (register/login/me)
|   |   +-- stores.py           #   Store CRUD + generation
|   |   +-- jobs.py             #   Background job tracking
|   |   +-- tenants.py          #   Tenant management
|   |   +-- ai_chat.py          #   AI chat endpoint
|   |   +-- preview.py          #   Store preview + HTML save
|   |   +-- health.py           #   Health & version checks
|   +-- models/                 # SQLAlchemy ORM models
|   |   +-- tenant.py           #   Tenant (organization)
|   |   +-- user.py             #   User + roles
|   |   +-- store.py            #   Store + config (JSONB)
|   |   +-- job.py              #   Background jobs
|   +-- schemas/                # Pydantic request/response schemas
|   +-- middleware/             # JWT auth + tenant isolation + rate limiting
|   +-- services/               # Business logic (auth, generator)
|   +-- workers/                # ARQ background job workers
|   +-- config.py               # App settings (pydantic-settings)
|   +-- database.py             # Async SQLAlchemy engine
|   +-- main.py                 # FastAPI entrypoint
+-- frontend/                   # Frontend (React + Vite)
|   +-- src/
|   |   +-- pages/              # 9 pages (Landing, Dashboard, AIBuilder, etc.)
|   |   +-- components/         # UI components + store editor
|   |   |   +-- editor/         #   Drag-and-drop editor (dnd-kit)
|   |   |   +-- layout/         #   App layout + sidebar
|   |   +-- context/            # Auth context (React Context)
|   |   +-- data/               # Template engine (12 templates, 21+ sections)
|   |   +-- lib/                # API client (Axios + interceptors)
|   |   +-- types/              # TypeScript interfaces
|   +-- vite.config.ts          # Vite config with API proxy
+-- tests/                      # Pytest test suite
+-- alembic/                    # Database migrations
+-- docker-compose.yml          # 4 services: API, Worker, Postgres, Redis
+-- Dockerfile                  # Python 3.12 + UV
+-- .github/workflows/ci.yml    # CI pipeline (lint, test, build)
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/health` | - | Health check |
| `GET` | `/docs` | - | Swagger UI |
| `POST` | `/api/v1/auth/register` | - | Register + create organization |
| `POST` | `/api/v1/auth/login` | - | Login (returns JWT) |
| `POST` | `/api/v1/auth/refresh` | Token | Refresh token |
| `GET` | `/api/v1/auth/me` | Token | Current user info |
| `GET` | `/api/v1/tenants/current` | Token | Current organization |
| `PATCH` | `/api/v1/tenants/current` | Owner | Update organization |
| `POST` | `/api/v1/stores/generate` | Token | Generate store (AI) |
| `GET` | `/api/v1/stores` | Token | List stores |
| `GET` | `/api/v1/stores/{id}` | Token | Store details |
| `PATCH` | `/api/v1/stores/{id}` | Owner | Update store |
| `DELETE` | `/api/v1/stores/{id}` | Owner | Delete store |
| `POST` | `/api/v1/ai/chat` | Token | AI chat (modify store) |
| `GET` | `/api/v1/preview/{id}` | Token | Preview store |
| `POST` | `/api/v1/preview/{id}/save-html` | Token | Save store HTML |
| `GET` | `/api/v1/jobs/{id}` | Token | Job status |
| `GET` | `/api/v1/jobs` | Token | List jobs |

---

## Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing page with template showcase |
| Login | `/login` | Authentication |
| Register | `/register` | Account creation |
| Dashboard | `/dashboard` | Store list + stats |
| Create Store | `/stores/create` | Template gallery + store name |
| AI Builder | `/stores/ai-builder` | Chat-based store editor |
| Store Detail | `/stores/:id` | Store info + preview |
| Edit Store | `/stores/:id/edit` | Drag-and-drop editor |
| 404 | `*` | Not found page |

---

## Development

```bash
# Run backend tests
pytest tests/ -v

# Run linter
ruff check app/ tests/
ruff format app/ tests/

# Frontend lint + build
cd frontend && npm run lint && npm run build

# Docker logs
docker compose logs -f api

# Reset database
docker compose down -v && docker compose up --build -d
```

---

## Environment Variables

See [.env.example](.env.example) for all available options. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | SQLite (dev) | Database connection string |
| `REDIS_URL` | - | Redis connection for cache + jobs |
| `JWT_SECRET_KEY` | - | **Change in production!** |
| `OPENAI_API_KEY` | - | Optional  enables AI features |
| `MAX_STORES_FREE` | 3 | Store limit for free plan |

---

## Roadmap

- [x] Multi-tenant auth system (JWT)
- [x] Store generation API
- [x] AI chat builder
- [x] 12 professional templates
- [x] Drag-and-drop section editor
- [x] Responsive RTL Arabic UI
- [x] Docker deployment
- [x] CI pipeline
- [ ] Products API + image upload
- [ ] Orders & analytics
- [ ] Payment integration (Moyasar / Tap)
- [ ] Shipping integration (Aramex / SMSA)
- [ ] Custom domains
- [ ] Email verification
- [ ] Template marketplace

---

## License

MIT License  see [LICENSE](LICENSE) for details.

Built with heart by **Wahed Ahmed**
