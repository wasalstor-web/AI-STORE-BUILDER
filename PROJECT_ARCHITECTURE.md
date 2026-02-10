# 🏗️ AI Store Builder - معمارية المشروع الاحترافية

> **نظام شامل لبناء متاجر إلكترونية بالذكاء الاصطناعي**
> آخر تحديث: فبراير 2026

---

## 📋 نظرة عامة

**AI Store Builder** منصة متقدمة لبناء متاجر إلكترونية احترافية باستخدام الذكاء الاصطناعي. النظام يجمع بين قوة Claude AI وواجهة مستخدم عصرية لتوفير تجربة سلسة في بناء وتخصيص المتاجر.

### 🎯 الأهداف الرئيسية

- ✅ بناء متجر احترافي كامل في دقائق
- ✅ تخصيص كامل عبر الذكاء الاصطناعي بالعربية
- ✅ واجهة drag & drop سهلة الاستخدام
- ✅ 12+ قالب جاهز احترافي
- ✅ تحسين تلقائي للتحويلات والمبيعات

---

## 🛠️ التقنيات الأساسية

### Backend Stack

```yaml
Framework: FastAPI 0.115+
Language: Python 3.11+
Database: SQLite (dev) | PostgreSQL (production)
AI Engine: Anthropic Claude Sonnet 4
Authentication: JWT + bcrypt
API Style: REST + WebSocket (real-time)
```

### Frontend Stack

```yaml
Framework: React 19.2.0 + TypeScript 5.9.3
Build Tool: Vite 7.2.4
Styling: TailwindCSS 4.1.18
State: Zustand 5.0.11
Data Fetching: TanStack Query 5.90.20
Animations: Framer Motion 12.33.0
DnD: DND Kit 6.3.1
Icons: Lucide React 0.563.0
Routing: React Router DOM 7.13.0
Notifications: React Hot Toast 2.6.0
```

---

## 📁 هيكل المشروع

```
AI-STORE-BUILDER/
│
├── 🐍 app/                          # Backend FastAPI
│   ├── api/                         # API Endpoints
│   │   ├── auth.py                  # Auth (register, login, me)
│   │   ├── ai_chat.py              # AI Chat Intelligence
│   │   ├── stores.py                # Store CRUD
│   │   ├── products.py              # Products management
│   │   ├── orders.py                # Orders & checkout
│   │   ├── payments.py              # Payment processing
│   │   ├── categories.py            # Category management
│   │   ├── tenants.py               # Multi-tenancy
│   │   ├── jobs.py                  # Background jobs
│   │   ├── uploads.py               # File uploads
│   │   ├── preview.py               # Store preview
│   │   └── health.py                # Health check
│   │
│   ├── models/                      # SQLAlchemy Models
│   │   ├── user.py                  # User model
│   │   ├── tenant.py                # Tenant (multi-tenancy)
│   │   ├── store.py                 # Store model
│   │   ├── product.py               # Product model
│   │   ├── category.py              # Category model
│   │   ├── order.py                 # Order model
│   │   └── job.py                   # Job queue model
│   │
│   ├── schemas/                     # Pydantic Schemas
│   │   ├── auth.py                  # Auth DTOs
│   │   ├── store.py                 # Store DTOs
│   │   ├── product.py               # Product DTOs
│   │   ├── order.py                 # Order DTOs
│   │   └── ...
│   │
│   ├── services/                    # Business Logic
│   │   ├── auth_service.py          # Authentication logic
│   │   ├── store_generator.py       # AI Store generation
│   │   ├── payment_service.py       # Payment integration
│   │   ├── tenant_service.py        # Multi-tenant logic
│   │   └── upload_service.py        # File handling
│   │
│   ├── middleware/                  # FastAPI Middleware
│   │   ├── auth.py                  # JWT authentication
│   │   ├── tenant.py                # Tenant isolation
│   │   └── rate_limit.py            # Rate limiting
│   │
│   ├── utils/                       # Utilities
│   │   └── sanitizer.py             # HTML/SQL sanitization
│   │
│   ├── workers/                     # Background Workers
│   │   └── store_worker.py          # Async job processing
│   │
│   ├── config.py                    # Configuration
│   ├── database.py                  # Database connection
│   └── main.py                      # Application entry
│
├── ⚛️ frontend/                      # React Frontend
│   ├── src/
│   │   ├── pages/                   # Route Pages
│   │   │   ├── Landing.tsx          # Homepage
│   │   │   ├── Login.tsx            # Login page
│   │   │   ├── Register.tsx         # Registration
│   │   │   ├── Dashboard.tsx        # User dashboard
│   │   │   ├── CreateStore.tsx      # Store wizard
│   │   │   ├── AIBuilder.tsx        # AI Builder [MAIN]
│   │   │   ├── EditStore.tsx        # Store editor
│   │   │   ├── StoreDetail.tsx      # Store details
│   │   │   └── NotFound.tsx         # 404 page
│   │   │
│   │   ├── components/              # Reusable Components
│   │   │   ├── layout/
│   │   │   │   └── Layout.tsx       # Main layout wrapper
│   │   │   ├── editor/
│   │   │   │   ├── StoreEditor.tsx  # Drag & drop editor
│   │   │   │   ├── SortableSection.tsx
│   │   │   │   ├── SectionProperties.tsx
│   │   │   │   ├── StorePreview.tsx
│   │   │   │   └── types.ts
│   │   │   ├── EnhancedAIChat.tsx   # Advanced AI chat
│   │   │   ├── graphics/
│   │   │   │   └── AppBackdrop.tsx  # Background effects
│   │   │   └── ErrorBoundary.tsx    # Error handling
│   │   │
│   │   ├── context/                 # React Context
│   │   │   └── AuthContext.tsx      # Auth state
│   │   │
│   │   ├── lib/                     # Utilities
│   │   │   ├── api.ts               # Axios API client
│   │   │   └── enhanced-ai-service.ts # WebSocket AI
│   │   │
│   │   ├── data/                    # Static Data
│   │   │   ├── templates.ts         # 12 Store templates
│   │   │   └── templateEngine.ts    # Section library
│   │   │
│   │   ├── types/                   # TypeScript Types
│   │   │   └── index.ts
│   │   │
│   │   ├── assets/                  # Assets
│   │   │   └── graphics/            # SVG backgrounds
│   │   │       ├── beams.svg
│   │   │       ├── mesh.svg
│   │   │       ├── noise.svg
│   │   │       └── orbs.svg
│   │   │
│   │   ├── App.tsx                  # App root
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles (1057 lines!)
│   │
│   ├── public/                      # Static files
│   ├── package.json                 # Dependencies
│   ├── vite.config.ts               # Vite config
│   └── tsconfig.json                # TypeScript config
│
├── 🗄️ alembic/                      # Database Migrations
│   └── versions/
│       ├── 001_initial.py
│       └── 002_products_orders.py
│
├── 🧪 tests/                         # Unit & Integration Tests
│   ├── test_auth.py
│   ├── test_stores.py
│   ├── test_health.py
│   └── conftest.py
│
├── 📝 Scripts & Config
│   ├── docker-compose.yml           # Docker orchestration
│   ├── Dockerfile                   # Backend container
│   ├── Dockerfile.api               # API container
│   ├── requirements.txt             # Python deps
│   ├── pyproject.toml               # Poetry config
│   ├── .env.example                 # Environment template
│   └── README.md                    # Documentation
│
└── 📚 Documentation
    ├── BLUEPRINT.md                 # Original blueprint
    ├── CLAUDE.md                    # Claude integration docs
    └── PROJECT_ARCHITECTURE.md      # This file
```

---

## 🔌 API Endpoints

### 🔐 Authentication (`/api/v1/auth`)

```
POST   /register          # Create new account
POST   /login             # Login user
GET    /me                # Get current user
POST   /refresh           # Refresh JWT token
```

### 🏪 Stores (`/api/v1/stores`)

```
GET    /stores            # List user stores
POST   /stores            # Create store
GET    /stores/{id}       # Get store details
PUT    /stores/{id}       # Update store
DELETE /stores/{id}       # Delete store
POST   /stores/{id}/publish   # Publish store
GET    /stores/{id}/analytics # Store analytics
```

### 🤖 AI Chat (`/api/v1/ai`)

```
POST   /ai/chat           # Send AI message
GET    /ai/test           # Test AI connection
WS     /ai/live           # WebSocket live chat
POST   /ai/suggest        # Get AI suggestions
```

### 📦 Products (`/api/v1/stores/{store_id}/products`)

```
GET    /products          # List products
POST   /products          # Create product
GET    /products/{id}     # Get product
PUT    /products/{id}     # Update product
DELETE /products/{id}     # Delete product
```

### 🛒 Orders (`/api/v1/stores/{store_id}/orders`)

```
GET    /orders            # List orders
POST   /orders            # Create order
GET    /orders/{id}       # Get order details
PUT    /orders/{id}/status # Update order status
POST   /orders/{id}/pay   # Process payment
```

### 📁 Categories, Tenants, Jobs, Uploads, Preview...

---

## 🧠 AI System Architecture

### Claude Integration

```python
Model: claude-sonnet-4-20250514
Max Tokens: 8000
System Prompt: AI Store Builder Pro
Language: Arabic (primary)
Capabilities:
  - Design changes (colors, layout, styles)
  - Add/remove sections
  - Content generation
  - Product management
  - SEO optimization
```

### AI Features

1. **Intent Classification** - فهم نية المستخدم:
   - تغيير الألوان
   - إضافة أقسام
   - تعديل المحتوى
   - إدارة المنتجات
   - تحسين التحويلات

2. **Real-time Processing** - معالجة فورية:
   - WebSocket للاستجابة الفورية
   - Progress indicators
   - Typing animations

3. **Context Awareness** - فهم السياق:
   - تاريخ المحادثة
   - نوع المتجر
   - تفضيلات المستخدم

---

## 🎨 Design System

### Colors

```css
/* Core Brand */
--primary: #6c5ce7; /* Indigo */
--accent: #00d4ff; /* Cyan */
--success: #10b981; /* Emerald */
--error: #ef4444; /* Red */
--warning: #f59e0b; /* Amber */

/* Dark Mode (4 depth levels) */
--dark-bg: #0a0a0f; /* Deepest */
--dark-elevated: #13131a; /* Level 1 */
--dark-card: #1a1a24; /* Level 2 */
--dark-hover: #222230; /* Level 3 */
```

### Typography

```css
Font Family: Tajawal (Arabic), Inter (English)
Sizes: 0.75rem → 3rem (12px → 48px)
Weights: 400, 500, 600, 700, 800
Line Heights: 1.2 → 1.8
```

### Spacing

```
8px grid system
Sizes: 2px, 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px, 128px
```

### Animations

```css
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Duration: 150ms, 200ms, 300ms
Effects:
  - Fade in/out
  - Slide in/out
  - Scale (90% → 100%)
  - Glow pulse
  - Shimmer loading
```

---

## 🗃️ Database Schema

### Core Tables

```sql
-- Users & Auth
users (id, email, password_hash, created_at, ...)
sessions (id, user_id, token, expires_at)

-- Multi-tenancy
tenants (id, name, domain, settings, owner_id, ...)

-- Stores
stores (id, tenant_id, name, domain, html, status, ...)
store_settings (store_id, theme, colors, fonts, ...)

-- Products
products (id, store_id, name, price, image, stock, ...)
categories (id, store_id, name, slug, ...)
product_categories (product_id, category_id)

-- Orders
orders (id, store_id, customer_email, total, status, ...)
order_items (id, order_id, product_id, quantity, price, ...)

-- Background Jobs
jobs (id, type, payload, status, result, ...)

-- AI & Analytics
ai_conversations (id, user_id, store_id, messages, ...)
store_analytics (store_id, date, views, orders, revenue, ...)
```

---

## 🚦 Performance Optimizations

### Backend

- ✅ Async SQLAlchemy for non-blocking DB operations
- ✅ Connection pooling (pool_size=5, max_overflow=10)
- ✅ Redis caching for AI responses (planned)
- ✅ Rate limiting (100 req/min per user)
- ✅ Background job queue for heavy tasks

### Frontend

- ✅ Code splitting (lazy loading pages)
- ✅ React.memo for expensive components
- ✅ Zustand for efficient state management
- ✅ TanStack Query for data caching
- ✅ Debounced inputs (300ms)
- ✅ Virtual scrolling for large lists (planned)
- ✅ Image lazy loading + WebP format

### Database

- ✅ Indexed foreign keys
- ✅ Composite indexes on (tenant_id, created_at)
- ✅ JSONB for flexible store settings
- ✅ Pagination (limit/offset)

---

## 🔒 Security Features

### Authentication

- JWT tokens (HS256 algorithm)
- Access token: 30 minutes
- Refresh token: 7 days
- bcrypt password hashing (12 rounds)

### API Security

- CORS configured per environment
- Rate limiting (SlowAPI)
- SQL injection protection (SQLAlchemy ORM)
- XSS protection (HTML sanitization)
- CSRF protection for state-changing operations

### Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000 (production)
```

---

## 🌐 Multi-Tenancy

### Isolation Strategy

- **Data Isolation**: tenant_id column in all tables
- **Domain Isolation**: subdomain.platform.com
- **Resource Isolation**: Per-tenant rate limits

### Tenant Features

- Custom domains
- Isolated databases (planned)
- Per-tenant settings & theming
- Usage quotas & billing

---

## 📊 Monitoring & Analytics

### Store Analytics

- Page views
- Unique visitors
- Conversion rate
- Revenue tracking
- Product performance
- User behavior flow

### System Metrics (planned)

- API response times
- Error rates
- AI performance
- Database query times
- Cache hit rates

---

## 🚀 Deployment

### Development

```bash
# Backend
cd c:\Users\wahed\Desktop\AI-STORE-BUILDER
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

### Production (Docker)

```bash
docker-compose up -d
```

### Environment Variables

```bash
# Essential
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=<openssl rand -hex 64>
ANTHROPIC_API_KEY=sk-ant-...

# Optional
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://...
SUPABASE_KEY=...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 📦 Key Dependencies

### Backend

```
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.36
alembic==1.14.0
pydantic==2.10.5
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
anthropic==0.25.1
slowapi==0.1.9
python-multipart==0.0.20
```

### Frontend

```json
{
  "react": "19.2.0",
  "typescript": "5.9.3",
  "vite": "7.2.4",
  "tailwindcss": "4.1.18",
  "@tanstack/react-query": "5.90.20",
  "zustand": "5.0.11",
  "framer-motion": "12.33.0",
  "@dnd-kit/core": "6.3.1",
  "axios": "1.13.4",
  "lucide-react": "0.563.0"
}
```

---

## 🎯 Roadmap

### Phase 1: Core (✅ Complete)

- [x] Authentication system
- [x] Store CRUD operations
- [x] Basic AI integration
- [x] 12 professional templates
- [x] Drag & drop editor

### Phase 2: Enhanced AI (🚧 In Progress)

- [x] Claude Sonnet 4 integration
- [x] Real-time chat UI
- [ ] WebSocket live updates
- [ ] Intent classification
- [ ] Conversation memory

### Phase 3: Advanced Features (📋 Planned)

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework
- [ ] Email marketing integration
- [ ] Payment gateway (Stripe/Paddle)
- [ ] Mobile app (React Native)

### Phase 4: Enterprise (🔮 Future)

- [ ] White-label solution
- [ ] API marketplace
- [ ] AI model fine-tuning
- [ ] Advanced permissions (RBAC)
- [ ] Compliance (GDPR, PCI-DSS)

---

## 📈 Statistics

```
Total Files: 80+
Backend Lines: ~8,500
Frontend Lines: ~6,800
Total Lines: ~15,300+
Languages: Python, TypeScript, CSS, SQL
API Endpoints: 35+
Database Tables: 12
UI Components: 25+
Store Templates: 12
AI Models: Claude Sonnet 4
```

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Write tests
4. Submit PR with description

### Code Standards

- **Python**: PEP 8, type hints, docstrings
- **TypeScript**: Strict mode, ESLint
- **Commits**: Conventional commits format

---

## 📞 Support & Contact

- **Documentation**: `/docs` API docs
- **Issues**: GitHub Issues
- **Email**: support@ai-store-builder.com (example)

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with 💜 by the AI Store Builder Team**

_Making e-commerce accessible through AI_
