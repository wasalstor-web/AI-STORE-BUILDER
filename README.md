# 🏗️ AI Store Builder

> **بناء المتاجر بالذكاء الاصطناعي — من فكرة → متجر شغّال بضغطة زر**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)](https://docker.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)](https://postgresql.org)

---

## ⚡ Quick Start — أمر واحد يشغّل كل شي

```bash
# 1. Clone & enter
cd AI-STORE-BUILDER

# 2. Create env file
cp .env.example .env

# 3. Launch everything (API + DB + Redis + Worker)
docker compose up --build -d

# 4. Open Swagger UI
# http://localhost:8000/docs
```

**هذا كل شي.** تشتغل 4 containers:
| Service | Port | Description |
|---------|------|-------------|
| `api` | 8000 | FastAPI server + Swagger |
| `worker` | — | ARQ background job processor |
| `db` | 5432 | PostgreSQL 16 |
| `redis` | 6379 | Redis 7 (cache + queue) |

---

## 🏛️ Architecture | المعمارية

```
Client → FastAPI (Auth + Tenant Isolation)
              ├── PostgreSQL (tenants, users, stores, jobs)
              ├── Redis (sessions, job queue)
              └── ARQ Worker (store generation)
```

**Multi-Tenant:** Row-level isolation — كل `tenant_id` يشوف بياناته بس.

---

## 🛣️ API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | ❌ | Health check |
| `GET` | `/docs` | ❌ | Swagger UI |
| `POST` | `/api/v1/auth/register` | ❌ | تسجيل حساب + منظمة |
| `POST` | `/api/v1/auth/login` | ❌ | تسجيل دخول |
| `POST` | `/api/v1/auth/refresh` | 🔑 | تجديد الرمز |
| `GET` | `/api/v1/auth/me` | 🔑 | بيانات المستخدم |
| `GET` | `/api/v1/tenants/current` | 🔑 | بيانات المنظمة |
| `PATCH` | `/api/v1/tenants/current` | 👑 | تعديل المنظمة |
| `POST` | `/api/v1/stores/generate` | 🔑 | توليد متجر (AI) |
| `GET` | `/api/v1/stores` | 🔑 | قائمة المتاجر |
| `GET` | `/api/v1/stores/{id}` | 🔑 | تفاصيل المتجر |
| `PATCH` | `/api/v1/stores/{id}` | 👑 | تعديل المتجر |
| `DELETE` | `/api/v1/stores/{id}` | 👑 | حذف المتجر |
| `POST` | `/api/v1/ai/chat` | 🔑 | تعديل المتجر بالذكاء الاصطناعي |
| `GET` | `/api/v1/preview/{id}` | 🔑 | معاينة المتجر |
| `POST` | `/api/v1/preview/{id}/save-html` | 🔑 | حفظ HTML المتجر |
| `GET` | `/api/v1/jobs/{id}` | 🔑 | حالة المهمة |
| `GET` | `/api/v1/jobs` | 🔑 | قائمة المهام |

---

## 🚀 Usage Example | مثال استخدام

### 1. Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "MySecure123!",
    "full_name": "أحمد محمد",
    "tenant_name": "متاجر أحمد"
  }'
```

### 2. Generate Store
```bash
curl -X POST http://localhost:8000/api/v1/stores/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "عطور الشرق",
    "store_type": "perfumes",
    "language": "ar",
    "branding": {"primary_color": "#8B4513", "style": "luxury"},
    "payment": {"gateway": "moyasar", "methods": ["mada", "visa"]},
    "shipping": {"provider": "aramex", "zones": ["SA"]}
  }'
```

### 3. Check Job Status
```bash
curl http://localhost:8000/api/v1/jobs/<job_id> \
  -H "Authorization: Bearer <token>"
```

---

## 🗄️ Database Models

| Table | Fields | Description |
|-------|--------|-------------|
| `tenants` | id, name, slug, plan, settings (JSONB) | المنظمات |
| `users` | id, tenant_id, email, role | المستخدمين |
| `stores` | id, tenant_id, name, config (JSONB), status | المتاجر |
| `jobs` | id, tenant_id, store_id, status, progress, result (JSONB) | المهام |

---

## 🛠️ Development

```bash
# Logs
docker compose logs -f api
docker compose logs -f worker

# Restart API only
docker compose restart api

# Run migrations manually
docker compose exec api alembic upgrade head

# Create new migration
docker compose exec api alembic revision --autogenerate -m "add_column"

# Stop everything
docker compose down

# Stop + remove volumes (reset DB)
docker compose down -v
```

---

## 📂 Project Structure

```
AI-STORE-BUILDER/
├── docker-compose.yml      # 4 services: api, worker, db, redis
├── Dockerfile              # Python 3.12 + UV
├── pyproject.toml           # Dependencies
├── .env                     # Environment variables
├── alembic/                 # Database migrations
│   └── versions/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Settings (pydantic-settings)
│   ├── database.py          # Async SQLAlchemy engine
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── api/                 # Route handlers
│   ├── middleware/          # Auth + Tenant isolation
│   ├── services/            # Business logic
│   └── workers/             # ARQ background jobs
└── tests/                   # Pytest test suite
```

---

## 🚀 Deploy to VPS

```bash
# 1. SSH into VPS
ssh user@your-vps

# 2. Clone repo
git clone <repo-url> && cd AI-STORE-BUILDER

# 3. Configure
cp .env.example .env
nano .env  # Update secrets, set APP_ENV=production

# 4. Launch
docker compose up --build -d

# 5. Done! API running on port 8000
# Add Nginx/Caddy reverse proxy for HTTPS
```

---

## 📄 License

MIT — Built with ❤️ by Wahed Ahmed

---

## 🚧 Roadmap | الميزات القادمة

- [ ] **Products API** — CRUD للمنتجات مع رفع الصور
- [ ] **Orders & Analytics API** — إحصائيات حقيقية للمتاجر
- [ ] **Email Verification** — تأكيد البريد عند التسجيل
- [ ] **Password Reset** — استعادة كلمة المرور عبر البريد
- [ ] **Custom Domains** — ربط نطاقات مخصصة
- [ ] **Payment Integration** — Moyasar / Tap للدفع الفعلي
- [ ] **Template Marketplace** — سوق قوالب من المجتمع
