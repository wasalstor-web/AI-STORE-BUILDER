# منشئ ويب فلو (WebFlow Builder) — Full-Stack Development Instructions

> Claude Code: أنت المطور الرئيسي لهذا المشروع. تطور كل شي — Frontend, Backend, Database, Server, Deployment.

## ⚠️ SAFE DEVELOPMENT RULES (MANDATORY)

### Stable Reference

- **Tag:** `v1.0-stable` — Last fully tested & working version
- **Commit:** `062c6dc` — 2026-02-10
- **Rollback:** `git checkout v1.0-stable` to restore everything instantly

### Golden Rules — NEVER Break Production

1. **ALWAYS create a branch** before making changes:
   ```bash
   git checkout -b feature/my-change
   ```
2. **NEVER edit directly on `main`** — main = production-ready only
3. **Build before merging** — `cd frontend && npx vite build` must succeed with 0 errors
4. **Test before merging** — both backend and frontend must respond:
   ```bash
   python -c "import urllib.request; r=urllib.request.urlopen('http://localhost:8000/health'); print(r.read())"
   python -c "import urllib.request; r=urllib.request.urlopen('http://localhost:3000/'); print('OK' if r.status==200 else 'FAIL')"
   ```
5. **Merge only after verification** — `git checkout main && git merge feature/my-change`
6. **Tag milestones** — after every significant stable release: `git tag -a v1.X-stable -m "desc"`

### Development Workflow

```
1. git checkout -b feature/xxx          # Create branch
2. Make changes                          # Edit code
3. cd frontend && npx vite build         # Verify frontend compiles
4. Test backend endpoints                # Verify backend works
5. Test in browser (localhost:3000)       # Visual check
6. git add -A && git commit              # Commit on branch
7. git checkout main && git merge feature/xxx  # Merge to main
8. git tag -a v1.X-stable -m "..."       # Tag if milestone
```

### Emergency Rollback

```bash
# Instant rollback to last stable:
git checkout v1.0-stable

# Or rollback specific file:
git checkout v1.0-stable -- frontend/src/pages/AIBuilderOptimized.tsx

# Or undo last commit (keep changes):
git reset --soft HEAD~1
```

### What NOT To Do

- ❌ Don't delete files without checking dependencies first
- ❌ Don't change package versions without testing
- ❌ Don't modify `.env` structure (breaks backend startup)
- ❌ Don't use Arabic comments in `.env` (causes Windows encoding crash)
- ❌ Don't edit `index.css` design system tokens without full regression test
- ❌ Don't remove imports that seem "unused" — React Compiler may need them

---

## Identity

You are a senior full-stack developer building "منشئ ويب فلو" (WebFlow Builder) — a SaaS platform like Salla/Zid powered by AI.
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

| Tech                 | Version     | Purpose                       |
| -------------------- | ----------- | ----------------------------- |
| Python               | 3.12        | Runtime                       |
| FastAPI              | 0.115+      | API framework                 |
| SQLAlchemy           | 2.0 (async) | ORM                           |
| Pydantic             | v2          | Validation                    |
| Alembic              | latest      | DB migrations                 |
| ARQ                  | latest      | Background jobs (Redis queue) |
| bcrypt + python-jose | latest      | Auth (JWT)                    |
| Anthropic SDK        | latest      | AI generation (primary)       |
| httpx                | latest      | HTTP client (OpenAI fallback) |

### Frontend

| Tech           | Version | Purpose           |
| -------------- | ------- | ----------------- |
| React          | 19.2.0  | UI library        |
| TypeScript     | 5.9     | Type safety       |
| Vite           | 7.2.4   | Build tool        |
| Tailwind CSS   | v4.1.18 | CSS-first styling |
| Zustand        | 5.0.11  | State management  |
| TanStack Query | 5.90.20 | Server state      |
| React Router   | 7.13.0  | Routing           |
| Framer Motion  | 12.33.0 | Animations        |
| dnd-kit        | 6.3.1   | Drag and drop     |
| Axios          | 1.13.4  | HTTP client       |

### Infrastructure

| Tech             | Purpose           |
| ---------------- | ----------------- |
| Docker + Compose | Containerization  |
| PostgreSQL 16    | Production DB     |
| SQLite           | Dev DB            |
| Redis 7          | Cache + Job queue |
| Nginx            | Reverse proxy     |
| Hostinger VPS    | Production server |

---

## Project Structure

```
WebFlow-Builder/
├── app/                        # ===== BACKEND (FastAPI) =====
│   ├── main.py                 # App entry + CORS + middleware
│   ├── config.py               # pydantic-settings (.env)
│   ├── database.py             # SQLAlchemy async engine
│   ├── api/                    # Route handlers
│   │   ├── auth.py             #   POST /register, /login, /refresh, GET /me
│   │   ├── stores.py           #   CRUD + POST /generate (AI)
│   │   ├── ai_chat.py          #   POST /chat + /conversation (AI)
│   │   ├── products.py         #   Product CRUD
│   │   ├── categories.py       #   Category CRUD
│   │   ├── orders.py           #   Order management
│   │   ├── payments.py         #   Payment processing
│   │   ├── jobs.py             #   Job progress tracking
│   │   ├── preview.py          #   Store preview HTML
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
│   │   └── order.py            #   Order + OrderItem
│   ├── schemas/                # Pydantic request/response
│   │   ├── ai_chat.py          #   AI request/response models
│   │   ├── auth.py             #   Auth DTOs
│   │   ├── store.py            #   Store DTOs + config models
│   │   ├── product.py          #   Product DTOs
│   │   ├── category.py         #   Category DTOs
│   │   ├── order.py            #   Order DTOs
│   │   ├── job.py              #   Job DTOs
│   │   ├── tenant.py           #   Tenant DTOs
│   │   └── common.py           #   APIResponse wrapper
│   ├── services/               # Business logic
│   │   ├── store_generator.py  #   AI store generation (Anthropic → OpenAI → Template)
│   │   ├── auth_service.py     #   Auth logic
│   │   ├── payment_service.py  #   Payment stubs
│   │   ├── tenant_service.py   #   Tenant creation
│   │   └── upload_service.py   #   File handling
│   ├── middleware/             # Request pipeline
│   │   ├── auth.py             #   JWT verification
│   │   ├── tenant.py           #   Tenant isolation
│   │   └── rate_limit.py       #   slowapi rate limiting
│   ├── utils/                  # Shared utilities
│   │   ├── db_helpers.py       #   get_store_or_404, slugify
│   │   └── sanitizer.py        #   HTML sanitizer (XSS prevention)
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
│       │   ├── AIBuilderOptimized.tsx  #   AI editor (chat + preview)
│       │   ├── StoreDetail.tsx #   Store details
│       │   ├── EditStore.tsx   #   Store editing (drag-drop)
│       │   └── NotFound.tsx    #   404
│       ├── components/
│       │   ├── builder/        #   ChatPanel, PreviewPanel, TopBar
│       │   ├── editor/         #   StoreEditor, SortableSection, SectionProperties
│       │   ├── graphics/       #   AppBackdrop
│       │   └── layout/         #   Layout (sidebar + header)
│       ├── data/
│       │   ├── templates.ts    #   12 store templates
│       │   └── templateEngine.ts  #   HTML generation engine (30+ sections)
│       ├── lib/api.ts          #   Axios client + JWT interceptors
│       ├── context/AuthContext.tsx
│       ├── types/              #   TypeScript interfaces
│       └── index.css           #   Tailwind v4 + Design System (700+ lines)
│
├── alembic/                    # Database migrations
├── tests/                      # pytest tests
├── docker-compose.yml          # Dev: PostgreSQL + Redis + API + Worker
├── Dockerfile                  # Python 3.12-slim + UV
├── safe-deploy.ps1             # Pre-deployment safety checks
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

- **Project:** منشئ ويب فلو (WebFlow Builder)
- **Developer:** Wahed Ahmed
- **GitHub:** wasalstor-web
- **Repo:** https://github.com/wasalstor-web/AI-STORE-BUILDER
- **VPS:** 147.93.120.99 (Hostinger)

---

## Continuation Guide (for resuming work)

### How to Resume Development

```bash
# 1. Start backend
powershell -ExecutionPolicy Bypass -File start_backend.ps1

# 2. Start frontend
cd frontend && npm run dev

# 3. Create feature branch for new work
git checkout -b feature/your-task

# 4. When done, verify & merge
cd frontend && npx vite build        # Must pass
git checkout main && git merge feature/your-task
```

### Key Architecture Decisions

- **AI Chat Flow:** User chats freely → says "نفّذ" → HTML is generated from conversation context
- **Two editing modes:** AI Builder (chat-based HTML) vs Visual Editor (drag-drop sections)
- **Multi-provider AI chain:** Anthropic → OpenAI → Gemini → Local fallback
- **Shared utilities:** `app/utils/db_helpers.py` for `get_store_or_404()` and `slugify()`
- **Schemas location:** ALL Pydantic models in `app/schemas/` (including `ai_chat.py`)

### What to Build Next (Phase 2)

1. Products CRUD frontend pages
2. Categories + filtering UI
3. Image upload (S3/local)
4. Shopping cart + checkout flow
5. Order management dashboard
