# 🧪 خطة اختبار شاملة - AI Store Builder

## 🎯 الهدف: اختبار جميع ميزات المشروع

### ✅ 1. اختبار البكند (API)

#### 🔌 Health & Core:

- [ ] `/health` - Health check
- [ ] `/docs` - API documentation
- [ ] `/api/v1/` - API versioning

#### 👤 المصادقة (Authentication):

- [ ] `POST /api/v1/auth/register` - تسجيل مستخدم جديد
- [ ] `POST /api/v1/auth/login` - تسجيل الدخول
- [ ] `POST /api/v1/auth/refresh` - تجديد الرمز المميز
- [ ] `GET /api/v1/auth/profile` - الحصول على الملف الشخصي
- [ ] `PUT /api/v1/auth/profile` - تحديث الملف الشخصي

#### 🏪 المتاجر (Stores):

- [ ] `GET /api/v1/stores` - قائمة المتاجر
- [ ] `POST /api/v1/stores` - إنشاء متجر جديد
- [ ] `GET /api/v1/stores/{id}` - الحصول على متجر محدد
- [ ] `PUT /api/v1/stores/{id}` - تحديث متجر
- [ ] `DELETE /api/v1/stores/{id}` - حذف متجر
- [ ] `POST /api/v1/stores/{id}/publish` - نشر متجر

#### 📦 المنتجات (Products):

- [ ] `GET /api/v1/products` - قائمة المنتجات
- [ ] `POST /api/v1/products` - إبر منتج جديد
- [ ] `GET /api/v1/products/{id}` - الحصول على منتج
- [ ] `PUT /api/v1/products/{id}` - تحديث منتج
- [ ] `DELETE /api/v1/products/{id}` - حذف منتج

#### 🔖 التصنيفات (Categories):

- [ ] `GET /api/v1/categories` - قائمة التصنيفات
- [ ] `POST /api/v1/categories` - إنشاء تصنيف
- [ ] `PUT /api/v1/categories/{id}` - تحديث تصنيف
- [ ] `DELETE /api/v1/categories/{id}` - حذف تصنيف

#### 🤖 الذكاء الاصطناعي (AI):

- [ ] `POST /api/v1/ai/chat` - محادثة AI
- [ ] `POST /api/v1/ai/generate-store` - توليد متجر بالـ AI
- [ ] `POST /api/v1/ai/optimize` - تحسين محتوى بالـ AI
- [ ] Test multi-provider fallback (Claude → GPT → Gemini)

#### 🛒 الطلبات (Orders):

- [ ] `GET /api/v1/orders` - قائمة الطلبات
- [ ] `POST /api/v1/orders` - إنشاء طلب
- [ ] `GET /api/v1/orders/{id}` - تفاصيل طلب
- [ ] `PUT /api/v1/orders/{id}` - تحديث حالة طلب

#### 💳 المدفوعات (Payments):

- [ ] Test Moyasar integration
- [ ] Test TAP payment gateway
- [ ] Payment webhooks

#### 📤 رفع الملفات (Uploads):

- [ ] `POST /api/v1/uploads` - رفع صورة
- [ ] Test Cloudflare R2 storage
- [ ] Test local file storage fallback

---

### ✅ 2. اختبار الفرونت إند (Frontend)

#### 🏠 صفحة الرئيسية:

- [ ] Hero section محمل صحيح
- [ ] Features section واضح
- [ ] CTA buttons تعمل
- [ ] Navigation menu
- [ ] Footer links
- [ ] Responsive design (mobile/tablet/desktop)

#### 👤 المصادقة:

- [ ] Register page - تسجيل مستخدم جديد
- [ ] Login page - تسجيل دخول
- [ ] Password validation
- [ ] Email verification flow
- [ ] Password reset
- [ ] Auto-login after registration
- [ ] Route protection (auth required)

#### 📊 Dashboard:

- [ ] Store cards display correctly
- [ ] Quick stats (stores, products, orders)
- [ ] Recent activity feed
- [ ] "Create New Store" button
- [ ] Store search/filter
- [ ] Performance metrics

#### 🏪 إنشاء متجر:

- [ ] Basic store info form
- [ ] Template selection
- [ ] Store customization
- [ ] Live preview
- [ ] Save as draft
- [ ] Publish store
- [ ] Domain/subdomain setup

#### 🤖 AI Store Builder:

- [ ] Chat interface responsive
- [ ] File upload (images, documents)
- [ ] Voice input/output
- [ ] Real-time preview
- [ ] Template suggestions
- [ ] Code generation
- [ ] Multi-language support
- [ ] Export functionality

#### ✏️ Store Editor:

- [ ] Drag & drop components
- [ ] Real-time preview
- [ ] Component properties panel
- [ ] Undo/redo functionality
- [ ] Save changes
- [ ] Publish to live
- [ ] Mobile preview mode
- [ ] SEO settings

#### 📦 Product Management:

- [ ] Add new products
- [ ] Edit product details
- [ ] Image upload/gallery
- [ ] Inventory tracking
- [ ] Pricing options
- [ ] Category assignment
- [ ] Bulk operations

#### 🛒 Order Management:

- [ ] Order list/grid view
- [ ] Order details page
- [ ] Status updates
- [ ] Customer information
- [ ] Payment tracking
- [ ] Shipping management
- [ ] Export orders

---

### ✅ 3. اختبار التكامل (Integration)

#### 🔄 End-to-End Workflows:

- [ ] **Flow 1:** Register → Create Store → Add Products → Configure → Publish
- [ ] **Flow 2:** Use AI Builder → Generate Store → Customize → Test Online
- [ ] **Flow 3:** Customer Visit → Browse Products → Place Order → Payment
- [ ] **Flow 4:** Store Owner → Receive Order → Process → Ship

#### 🔒 Security Tests:

- [ ] JWT token validation
- [ ] CORS policy working
- [ ] SQL injection protection
- [ ] XSS protection (HTML sanitizer)
- [ ] File upload restrictions
- [ ] Rate limiting
- [ ] HTTPS enforcement (production)

#### 📱 Cross-platform Testing:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS/Android)
- [ ] Different screen sizes

#### ⚡ Performance Testing:

- [ ] Page load times
- [ ] API response times
- [ ] Large file uploads
- [ ] Concurrent user handling
- [ ] Database query optimization

---

### ✅ 4. اختبار Production

#### 🌐 Hostinger VPS (147.93.120.99):

- [ ] Backend health: http://147.93.120.99:9000/health
- [ ] Frontend loading: http://147.93.120.99/
- [ ] API functionality
- [ ] Database connectivity
- [ ] SSL certificate (upcoming)
- [ ] Backup procedures
- [ ] Monitoring/logging

---

## 📋 Test Checklist Template

```bash
# Quick Health Test Script
echo "🏥 AI Store Builder Health Check"

# Local Tests
curl http://127.0.0.1:8000/health
curl http://localhost:3005/

# Production Tests
curl http://147.93.120.99:9000/health
curl http://147.93.120.99/

# Database Test
curl -X POST http://127.0.0.1:8000/api/v1/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Store", "description": "Test"}'
```

---

## 🎯 الأولوية:

1. **🔥 High Priority:** Core functionality (auth, stores, AI)
2. **🟡 Medium Priority:** Advanced features (orders, payments)
3. **🟢 Low Priority:** Nice-to-have (analytics, SEO tools)

---

## ✅ نتائج الاختبار:

سيتم تسجيل نتائج كل اختبار هنا مع:

- ✅ يعمل بنجاح
- ⚠️ يعمل مع مشاكل طفيفة
- ❌ لا يعمل - يحتاج إصلاح
- 🔄 قيد الاختبار
