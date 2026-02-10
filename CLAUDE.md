# AI Store Builder — Full-Stack Development Instructions

> Claude Code: أنت المطور الرئيسي لهذا المشروع. تطور كل شي — Frontend, Backend, Database, Server, Deployment.

## Identity
You are a senior full-stack developer building "AI Store Builder" — a SaaS platform like Salla/Zid powered by AI.
You own the ENTIRE project: code, database, server, deployment, everything.

---

## Project Overview
User describes their store → AI generates a complete e-commerce store in minutes.
- Multi-tenant SaaS (each user = separate organization)
- Arabic-first, RTL, Dark Mode
- AI-powered store generation + AI chat editing

---

## Tech Stack

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| Python | 3.12 | Runtime |
| FastAPI | 0.115+ | API framework |
| SQLAlchemy | 2.0 (async) | ORM |
| Pydantic | v2 | Validation |
| Alembic | latest | DB migrations |
| ARQ | latest | Background jobs (Redis queue) |
| bcrypt + python-jose | latest | Auth (JWT) |
| Anthropic SDK | latest | AI generation (primary) |
| httpx | latest | HTTP client (OpenAI fallback) |

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| React | 19.2.0 | UI library |
| TypeScript | 5.9 | Type safety |
| Vite | 7.2.4 | Build tool |
| Tailwind CSS | v4.1.18 | CSS-first styling |
| Zustand | 5.0.11 | State management |
| TanStack Query | 5.90.20 | Server state |
| React Router | 7.13.0 | Routing |
| Framer Motion | 12.33.0 | Animations |
| dnd-kit | 6.3.1 | Drag and drop |
| Axios | 1.13.4 | HTTP client |

### Infrastructure
| Tech | Purpose |
|------|---------|
| Docker + Compose | Containerization |
| PostgreSQL 16 | Production DB |
| SQLite | Dev DB |
| Redis 7 | Cache + Job queue |
| Nginx | Reverse proxy |
| Hostinger VPS | Production server |

---

## Project Structure
```
AI-STORE-BUILDER/
├── app/                        # ===== BACKEND (FastAPI) =====
│   ├── main.py                 # App entry + CORS + middleware
│   ├── config.py               # pydantic-settings (.env)
│   ├── database.py             # SQLAlchemy async engine
│   ├── api/                    # Route handlers
│   │   ├── auth.py             #   POST /register, /login, /refresh, GET /me
│   │   ├── stores.py           #   CRUD + POST /generate (AI)
│   │   ├── ai_chat.py          #   POST /chat (AI modify store)
│   │   ├── products.py         #   Product CRUD
│   │   ├── categories.py       #   Category CRUD
│   │   ├── orders.py           #   Order management
│   │   ├── payments.py         #   Payment processing
│   │   ├── jobs.py             #   Job progress tracking
│   │   ├── preview.py          #   Store preview + HTML export
│   │   ├── uploads.py          #   File upload
│   │   ├── tenants.py          #   Tenant management
│   │   └── health.py           #   Health check
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── base.py             #   TenantBase + UUID7
│   │   ├── tenant.py           #   Tenant (organization)
│   │   ├── user.py             #   User + roles
│   │   ├── store.py            #   Store + JSONB config
│   │   ├── job.py              #   Background job tracking
│   │   ├── product.py          #   Product
│   │   ├── category.py         #   Category
│   │   └── order.py            #   Order
│   ├── schemas/                # Pydantic request/response
│   ├── services/               # Business logic
│   │   ├── store_generator.py  #   AI store generation (Anthropic → OpenAI → Template)
│   │   ├── auth_service.py     #   Auth logic
│   │   ├── payment_service.py  #   Payment stubs
│   │   └── upload_service.py   #   File handling
│   ├── middleware/             # Request pipeline
│   │   ├── auth.py             #   JWT verification
│   │   ├── tenant.py           #   Tenant isolation
│   │   └── rate_limit.py       #   slowapi rate limiting
│   └── workers/               # Background processors
│       └── store_worker.py     #   ARQ worker
│
├── frontend/                   # ===== FRONTEND (React 19) =====
│   └── src/
│       ├── pages/              # 9 pages
│       │   ├── Landing.tsx     #   Marketing page
│       │   ├── Login.tsx       #   Auth
│       │   ├── Register.tsx    #   Auth
│       │   ├── Dashboard.tsx   #   Main dashboard
│       │   ├── CreateStore.tsx #   Store creation wizard
│       │   ├── AIBuilder.tsx   #   AI editor (canvas + chat)
│       │   ├── StoreDetail.tsx #   Store details
│       │   ├── EditStore.tsx   #   Store editing
│       │   └── NotFound.tsx    #   404
│       ├── components/
│       │   ├── editor/         #   Canvas, SectionLibrary, PropertiesPanel, DeviceSwitcher
│       │   └── layout/         #   Sidebar, Header
│       ├── data/
│       │   ├── templates.ts    #   12 store templates
│       │   └── sections.ts     #   21+ drag-drop sections
│       ├── lib/api.ts          #   Axios client + JWT interceptors
│       ├── context/AuthContext.tsx
│       ├── types/              #   TypeScript interfaces
│       └── index.css           #   Tailwind v4 + Design System (700+ lines)
│
├── alembic/                    # Database migrations
├── tests/                      # pytest tests
├── docker-compose.yml          # Dev: PostgreSQL + Redis + API + Worker
├── Dockerfile                  # Python 3.12-slim + UV
├── nginx-aisb-api.conf         # Production Nginx config
├── .env                        # Environment variables
└── .docs/                      # Documentation
```

---

## Server & Deployment

### Production Server (Hostinger VPS)
```
IP:       147.93.120.99
OS:       Ubuntu 24.04.3 LTS
RAM:      16GB
Storage:  193GB (38GB used)
User:     root
```

### Server Services Running
- Supabase stack (13 containers)
- PostgreSQL 15.8 (via Supabase on port 5432)
- Kong Gateway (port 8000/8443)

### AI Store Builder on Server
```
Path:     /var/www/ai-store-builder (frontend static files)
API:      port 9000 (proxied via Nginx)
Nginx:    /etc/nginx/sites-enabled/nginx-aisb-api.conf
```

### Deployment Workflow
```bash
# 1. Build frontend locally
cd frontend && npm run build

# 2. Upload to server
scp -r dist/* root@147.93.120.99:/var/www/ai-store-builder/

# 3. SSH to server and deploy backend
ssh root@147.93.120.99
cd /opt/ai-store-builder  # or wherever backend lives
git pull
docker compose up -d --build

# 4. Reload nginx
nginx -t && systemctl reload nginx
```

### Nginx Config
- Frontend: served static from `/var/www/ai-store-builder`
- API: proxied `/api/` → `http://127.0.0.1:9000/api/`
- CORS: allows `https://ai-store-builder.pages.dev`

---

## Database

### Dev (Local)
```
DATABASE_URL=sqlite+aiosqlite:///./aisb_dev.db
```

### Production (Server)
```
DATABASE_URL=postgresql+asyncpg://aisb:aisb_secret_2026@db:5432/ai_store_builder
```

### Tables (7)
tenants, users, stores, jobs, products, categories, orders
- Every table has `tenant_id` for multi-tenant isolation
- UUIDs use uuid7 (time-sortable)
- Store config stored as JSONB

### Migrations
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

---

## AI Integration

### Priority Chain
1. **Anthropic Claude** (claude-sonnet-4-20250514) — primary
2. **OpenAI** (gpt-4o-mini) — fallback
3. **Template engine** — offline fallback

### Used In
- `app/services/store_generator.py` — AI store generation
- `app/api/ai_chat.py` — AI chat to modify store HTML

### API Keys (in .env)
```
ANTHROPIC_API_KEY=sk-ant-...  (configured)
OPENAI_API_KEY=               (empty - optional fallback)
```

---

## Design System (Genius Grade v2.0)
- Signature: `#6366F1` (Indigo Violet)
- Neutrals: Blue-tinted (no true black), base `#0B0D14`
- Contrast: WCAG AAA (7:1+)
- Spacing: 4px grid
- Type: 1.125x scale
- Font: Tajawal (Arabic), Inter (English)
- Reference: Linear, Stripe, Apple, Vercel

---

## Development Commands

### Local Dev
```bash
# Backend (from project root)
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev    # port 3000

# Both via Docker
docker compose up --build -d
```

### Testing
```bash
pytest tests/ -v --cov=app     # Backend
cd frontend && npm run lint    # Frontend
ruff check app/ && ruff format app/  # Python lint
```

### Build
```bash
cd frontend && npm run build   # Creates dist/
```

---

## Coding Rules

### General
1. Production-ready code only — no prototypes
2. Arabic for user-facing text, English for code
3. Never commit .env or API keys
4. Always multi-tenant: filter by tenant_id

### Backend (Python)
1. Async/await everywhere (SQLAlchemy async, httpx async)
2. Type hints on all functions
3. Pydantic v2 for all request/response schemas
4. Handle errors gracefully with proper HTTP status codes
5. Rate limit sensitive endpoints (auth, AI)
6. Sanitize HTML output (bleach)

### Frontend (TypeScript)
1. TypeScript strict mode
2. Tailwind CSS v4 (CSS-first, @theme in index.css)
3. RTL Arabic-first (dir="rtl", font-family: Tajawal)
4. Dark mode support always
5. Mobile-first responsive (320px → 2560px)
6. Zustand for client state, TanStack Query for server state
7. Framer Motion for animations
8. WCAG 2.1 AA accessibility minimum

### Git
```bash
# Commit format
feat: description     # New feature
fix: description      # Bug fix
chore: description    # Maintenance
docs: description     # Documentation
```

---

## Current Progress

### Phase 1: MVP — COMPLETE
- [x] Multi-tenant auth (JWT)
- [x] 12 templates + 21 sections
- [x] AI store generation (Anthropic/OpenAI)
- [x] AI chat builder
- [x] Drag-drop editor
- [x] RTL Arabic UI
- [x] Dark theme (Genius Grade v2.0)
- [x] Docker deployment
- [x] Design system v2.0
- [x] VPS deployment (Nginx + static frontend)

### Phase 2: E-commerce Core — IN PROGRESS
- [ ] Products CRUD (frontend pages)
- [ ] Categories + filtering
- [ ] Image upload (S3/local)
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Order management dashboard

### Phase 3: Payments & Shipping — PLANNED
- [ ] Moyasar integration (Saudi)
- [ ] Tap Payments (MENA)
- [ ] Aramex shipping API
- [ ] SMSA shipping API
- [ ] Order tracking

### Phase 4: Advanced — PLANNED
- [ ] Custom domains
- [ ] Email verification
- [ ] Analytics dashboard
- [ ] SEO optimization
- [ ] Template marketplace

---

## Owner
- **Developer:** Wahed Ahmed
- **GitHub:** wasalstor-web
- **Repo:** https://github.com/wasalstor-web/AI-STORE-BUILDER
- **VPS:** 147.93.120.99 (Hostinger)
