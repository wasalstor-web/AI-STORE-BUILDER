# 🎨 AI Store Builder — Design System Rules (Figma ↔ Code)

## نظام التصميم الموحد

---

## 1. الألوان (Color Tokens)

### خلفيات (Backgrounds)
| Token | Hex | Usage |
|---|---|---|
| `dark-bg` | `#06060A` | خلفية الصفحة الرئيسية |
| `dark-surface` | `#0E0E16` | خلفية البطاقات والأسطح |
| `dark-card` | `#151520` | بطاقات داخلية |
| `dark-border` | `#1E1E32` | الحدود |
| `dark-hover` | `#1A1A30` | حالة التمرير |
| `dark-elevated` | `#1C1C2E` | عناصر مرتفعة |

### الألوان الأساسية (Primary)
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#7C6CF0` | اللون البنفسجي الرئيسي |
| `primary-light` | `#A89EFF` | نصوص تفاعلية / hover |
| `primary-dark` | `#5A4BD4` | أزرار متدرجة |

### لون ثانوي (Accent)
| Token | Hex | Usage |
|---|---|---|
| `accent` | `#00D4C8` | أخضر مائي — CTA ثانوي |
| `accent-light` | `#4EEADF` | hover الثانوي |

### ألوان دلالية (Semantic)
| Token | Hex | Usage |
|---|---|---|
| `warning` | `#F0C040` | تنبيهات |
| `danger` | `#F06060` | حذف / خطأ |
| `success` | `#00C48C` | نجاح / نشط |
| `info` | `#4C9AF0` | معلومات |

### النصوص (Text)
| Token | Hex | Contrast | Usage |
|---|---|---|---|
| `text-primary` | `#EAEAF4` | 15.4:1 ✅ | نص رئيسي |
| `text-secondary` | `#9A9AC0` | 4.8:1 ✅ | نص ثانوي (WCAG AA) |
| `text-muted` | `#505078` | 2.1:1 ⚠️ | نص باهت / placeholders (decorative only) |

---

## 2. الخطوط (Typography)

### العائلة
- **عربي أول:** Tajawal
- **لاتيني:** Inter
- **احتياطي:** system-ui, sans-serif

### الأحجام
| Element | Size | Weight | Line Height |
|---|---|---|---|
| Hero Title | 48-64px | 800 (ExtraBold) | 1.1 |
| Page Title | 28-36px | 700 (Bold) | 1.2 |
| Section Title | 20-24px | 600 (SemiBold) | 1.3 |
| Card Title | 16-18px | 600 | 1.4 |
| Body | 15-16px | 400 (Regular) | 1.6 |
| Small/Meta | 12-14px | 500 | 1.4 |
| Badge | 11px | 600 | 1 |
| Section Label | 10px | 700 | 1 |

### النص المتدرج (Gradient Text)
```
background: linear-gradient(135deg, #A89EFF 0%, #00D4C8 100%)
-webkit-background-clip: text
```

---

## 3. المكونات (Components)

### Glass Card
```
Background: rgba(21, 21, 32, 0.7)
Backdrop: blur(24px) saturate(1.2)
Border: 1px solid #1E1E32
Border Radius: 16px
```

### Glass Card Glow (مع توهج)
```
Border: 1px solid rgba(124, 108, 240, 0.15)
Shadow: 0 0 40px rgba(124, 108, 240, 0.06)
Inner glow: inset 0 1px 0 rgba(255, 255, 255, 0.03)
Hover Border: rgba(124, 108, 240, 0.3)
Hover Shadow: 0 0 60px rgba(124, 108, 240, 0.1), 0 20px 60px rgba(0,0,0,0.3)
Hover Transform: translateY(-2px)
```

### أزرار (Buttons)
| Type | Background | Padding | Radius |
|---|---|---|---|
| Primary | gradient(135deg, #7C6CF0 → #5A4BD4) | 12px 28px | 14px |
| Accent | gradient(135deg, #00D4C8 → #00A89E) | 12px 28px | 14px |
| Outline | transparent, border: #1E1E32 | 12px 28px | 14px |
| Ghost | transparent | 10px 20px | 12px |
| Danger | gradient(135deg, #F06060 → #D04040) | 12px 28px | 14px |

#### حالات الأزرار (Button States)
```css
/* Default */
opacity: 1, transform: scale(1)

/* Hover */
opacity: 0.9, transform: translateY(-1px)
box-shadow: 0 8px 24px rgba(124, 108, 240, 0.2)
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)

/* Active/Pressed */
transform: scale(0.98)
opacity: 0.85

/* Focus (Keyboard) */
outline: 2px solid #7C6CF0
outline-offset: 2px

/* Loading */
cursor: not-allowed
opacity: 0.7
pointer-events: none
/* Spinner icon: animate rotation 0.6s linear infinite */

/* Disabled */
opacity: 0.4
cursor: not-allowed
pointer-events: none
background: desaturate
```

### حقول الإدخال (Input Fields)
```css
/* Default */
Background: #0E0E16 (dark-surface)
Border: 1px solid #1E1E32
Radius: 14px
Padding: 12px 16px
Direction: RTL (except email/password: dir="ltr")
Transition: all 0.2s ease

/* Focus */
Border: 1px solid #7C6CF0
Box-shadow: 0 0 0 3px rgba(124, 108, 240, 0.12)
Outline: none

/* Hover */
Border: 1px solid #4A4A78

/* Error */
Border: 1px solid #F06060
Box-shadow: 0 0 0 3px rgba(240, 96, 96, 0.12)

/* Success */
Border: 1px solid #00C48C
Box-shadow: 0 0 0 3px rgba(0, 196, 140, 0.12)

/* Disabled */
Background: #0A0A10
Border: 1px solid #1E1E32
Opacity: 0.5
Cursor: not-allowed

/* Placeholder */
Color: #505078 (text-muted)
Opacity: 1
```

### الشارات (Badges)
```
Font: 11px, weight 600
Padding: 3px 10px
Radius: 8px
Variants: primary, accent, success, warning, danger, neutral
Pattern: bg opacity 12%, text full color, border opacity 20%
```

---

## 4. التخطيط (Layout)

### RTL أولاً
- `direction: rtl` على كل الصفحات
- حقول email/password تكون `dir="ltr"`
- النصوص العربية: Tajawal
- الأرقام والرموز: Inter

### الشبكة (Grid)
- **Landing:** Full-width sections, `max-w-7xl` container
- **Dashboard:** Sidebar (264px) + Main content
- **AI Builder:** 3 أعمدة (380px panel + flex preview + optional panel)
- **Editor:** 3 أعمدة (272px + flex + 256px)

### الاستجابة (Responsive)

#### Breakpoints
```css
mobile: 0-767px
tablet: 768px-1023px
desktop: 1024px-1439px
desktop-lg: 1440px+
```

#### سلوك كل صفحة

**Landing Page:**
- Mobile: Nav → Hamburger menu, Hero → 1 col, Templates → 1 col, Features → 1 col, Pricing → 1 col
- Tablet: Hero → 1 col (center), Templates → 2 cols, Features → 2 cols, Pricing → 3 cols stacked
- Desktop: Full layout

**Dashboard:**
- Mobile: Sidebar → Bottom sheet drawer (slide up), Stats → 1 col, Stores → 1 col
- Tablet: Sidebar → Overlay (left slide), Stats → 2×2 grid, Stores → 2 cols
- Desktop: Sidebar fixed 264px, Stats → 4 cols, Stores → 3 cols

**AI Builder:**
- Mobile: Chat → Bottom drawer (toggle), Canvas → Full width, Sections → Hidden (FAB button)
- Tablet: Chat → Left drawer (slide), Canvas → Full width, Sections → Right drawer
- Desktop: 3-col layout (380px + flex + 320px collapsible)

**Store Detail:**
- Mobile: Sidebar → Bottom sheet, Tabs → Horizontal scroll, Charts → Stack vertical
- Tablet: Sidebar → Accordion below, Tabs → Full width, Charts → 2 cols
- Desktop: Right sidebar 320px, Tabs → Full, Charts → Responsive grid

**Edit Store:**
- Mobile: Split → Tabs (Code/Preview switch), File manager → Drawer
- Tablet: Split → 40/60, File manager → Collapsible
- Desktop: Split → 50/50 resizable, File manager → Sidebar

### Sidebar (لوحة التحكم)
```
Width: 264px (desktop), overlay (mobile)
Background: dark-surface
Border-left: 1px solid dark-border
```

---

## 5. الخلفيات والتأثيرات (Backgrounds & Effects)

### Mesh Background
```
Radial gradient at 20% 20%: rgba(124, 108, 240, 0.06)
Radial gradient at 80% 80%: rgba(0, 212, 200, 0.04)
Radial gradient at 50% 50%: rgba(124, 108, 240, 0.02)
```

### بؤر ضوء (Light Orbs)
```
Primary orb: bg-primary/20, blur(120px), 300x300px
Accent orb: bg-accent/15, blur(100px), 200x200px
```

### نقاط الشبكة (Dot Grid)
```
Radial dot: rgba(124, 108, 240, 0.08), 1px
Grid size: 24x24px
```

---

## 6. الحركة (Animations)

| Animation | Duration | Easing Curve | Usage |
|---|---|---|---|
| float | 3s | ease-in-out | أيقونات Hero |
| pulse-glow | 2.5s | cubic-bezier(0.4, 0, 0.6, 1) | بطاقات مميزة |
| slide-up | 0.5s | cubic-bezier(0.16, 1, 0.3, 1) | ظهور العناصر |
| fade-in | 0.4s | ease-out | انتقالات |
| shimmer | 2.5s | linear | Loading skeleton |
| gradient-shift | 6s | ease-in-out | خلفيات متحركة |
| orbit | 20s | linear | زخارف Hero |
| bounce | 0.6s | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Success animations |
| scale | 0.2s | cubic-bezier(0.4, 0, 0.2, 1) | Button hover/press |

### Framer Motion Defaults
```javascript
// Page transitions
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
exit: { opacity: 0, y: -20 }
transition: { 
  duration: 0.5, 
  ease: [0.16, 1, 0.3, 1] // easeOutExpo
}

// Modal/Drawer
initial: { opacity: 0, scale: 0.95 }
animate: { opacity: 1, scale: 1 }
transition: { duration: 0.2, ease: "easeOut" }

// Toast notifications
initial: { opacity: 0, x: 50, scale: 0.9 }
animate: { opacity: 1, x: 0, scale: 1 }
exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } }
```

### Timing Guidelines
- **Micro-interactions:** 100-200ms (hover, focus)
- **UI transitions:** 200-300ms (modals, dropdowns)
- **Page transitions:** 400-500ms (route changes)
- **Complex animations:** 600-800ms (multi-step)
- **Ambient animations:** 2-6s (background effects)

---

## 7. الأيقونات (Icons)

- **المكتبة:** Lucide React v0.454.0 (pin exact version)
- **الأحجام:** 16px (صغير), 20px (عادي), 24px (متوسط), 32-48px (كبير)
- **الألوان:** text-secondary (عادي), primary-light (تفاعلي), accent (ثانوي)
- **Stroke Width:** 2px (default), 2.5px (bold icons)
- **Store Types Emojis:** 👗👕👠💄🍳🏠💍⚽👶🏈🏪✨🔌📱🎮💻🌿🧴

### Icon Usage
```jsx
import { Icon } from 'lucide-react';

// Default
<Icon size={20} strokeWidth={2} className="text-text-secondary" />

// Interactive
<Icon size={20} className="text-primary-light hover:text-primary" />

// Button icon
<Icon size={18} className="mr-2" /> // 2px spacing
```

---

## 8. الصفحات المطلوبة في Figma

| # | الصفحة | النوع | الأولوية |
|---|---|---|---|
| 1 | Landing Page | تسويقي | 🔴 عالية |
| 2 | Login | نموذج | 🔴 عالية |
| 3 | Register | نموذج | 🔴 عالية |
| 4 | Dashboard | لوحة تحكم | 🔴 عالية |
| 5 | Create Store (Step 1) | معالج | 🟡 متوسطة |
| 6 | Create Store (Step 2 - Templates) | معرض | 🟡 متوسطة |
| 7 | AI Builder | محرر | 🔴 عالية |
| 8 | Store Detail | صفحة تفصيل | 🟡 متوسطة |
| 9 | Store Editor | محرر | 🟡 متوسطة |
| 10 | 404 Page | خطأ | 🟢 منخفضة |

---

## 9. الأجهزة (Frames)

| Device | Width | Usage |
|---|---|---|
| Desktop | 1440px | التصميم الرئيسي |
| Tablet | 768px | استجابة |
| Mobile | 375px | موبايل |

---

## 10. إمكانية الوصول (Accessibility - WCAG 2.1 AA)

### ARIA Labels
كل العناصر التفاعلية يجب أن تحتوي على:
```jsx
// Buttons
<button aria-label="إرسال الرسالة">
<button aria-labelledby="button-id">

// Links
<a aria-label="انتقل إلى الصفحة الرئيسية">

// Inputs
<input aria-label="البريد الإلكتروني" aria-describedby="email-error" />
<span id="email-error" role="alert">البريد غير صحيح</span>

// Nav
<nav aria-label="التنقل الرئيسي">

// Regions
<aside role="complementary" aria-label="الشريط الجانبي">
<main role="main" aria-label="المحتوى الرئيسي">
```

### Keyboard Navigation
| Key | Action |
|---|---|
| `Tab` | الانتقال للعنصر التالي |
| `Shift + Tab` | العودة للعنصر السابق |
| `Enter` | تفعيل زر/رابط |
| `Space` | تفعيل checkbox/toggle |
| `Escape` | إغلاق Modal/Drawer |
| `Arrow Keys` | التنقل في Dropdowns/Tabs |
| `Home/End` | أول/آخر عنصر في قائمة |

#### Tab Order
```
1. Logo/Brand
2. Main Navigation (right to left)
3. Search (if visible)
4. User Menu
5. Main Content (top to bottom, right to left)
6. Sidebar (if present)
7. Footer Links
```

### Focus States
```css
/* Focus visible (keyboard only) */
*:focus-visible {
  outline: 2px solid #7C6CF0;
  outline-offset: 2px;
  border-radius: inherit;
}

/* Remove outline on mouse click */
*:focus:not(:focus-visible) {
  outline: none;
}

/* Skip to main content */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: #7C6CF0;
  color: white;
  padding: 8px 16px;
  z-index: 1000;
}

.skip-to-main:focus {
  top: 0;
}
```

### Screen Readers
```jsx
// Visually hidden but accessible
<span className="sr-only">تحميل...</span>

// Live regions
<div role="status" aria-live="polite" aria-atomic="true">
  {message}
</div>

// Alert
<div role="alert" aria-live="assertive">
  {error}
</div>
```

### Color Contrast (WCAG AA)
| Pairing | Ratio | Pass |
|---|---|---|
| text-primary on dark-bg | 15.4:1 | ✅ AAA |
| text-secondary on dark-bg | 4.8:1 | ✅ AA |
| primary on dark-bg | 4.8:1 | ✅ AA |
| accent on dark-bg | 5.2:1 | ✅ AA |
| text-muted on dark-bg | 2.1:1 | ⚠️ Decorative only |

---

## 11. الحالات (States)

### Loading States
```jsx
// Button loading
<button disabled>
  <Loader2 size={18} className="animate-spin mr-2" />
  جاري التحميل...
</button>

// Page loading (Skeleton)
<div className="animate-shimmer bg-gradient-to-r from-dark-card via-dark-elevated to-dark-card">
  {/* Content skeleton */}
</div>

// Full page loading
<div className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    <Sparkles size={48} className="animate-pulse mb-4" />
    <p>جاري التحميل...</p>
  </div>
</div>
```

### Error States
```jsx
// Form field error
<div>
  <input className="border-danger" aria-invalid="true" />
  <p className="text-danger text-sm mt-1" role="alert">
    البريد الإلكتروني مطلوب
  </p>
</div>

// Page error
<div className="text-center py-12">
  <AlertCircle size={48} className="text-danger mb-4" />
  <h3 className="text-xl mb-2">حدث خطأ</h3>
  <p className="text-text-secondary mb-4">{errorMessage}</p>
  <button onClick={retry}>إعادة المحاولة</button>
</div>

// Toast error
toast.error('فشلت العملية', {
  icon: <X size={20} />,
  duration: 4000,
});
```

### Empty States
```jsx
<div className="text-center py-16">
  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-elevated flex items-center justify-center">
    <Package size={48} className="text-text-muted" />
  </div>
  <h3 className="text-xl mb-2">لا توجد متاجر بعد</h3>
  <p className="text-text-secondary mb-6">
    ابدأ بإنشاء متجرك الأول بالذكاء الاصطناعي
  </p>
  <button className="btn-primary">
    <PlusCircle size={20} className="mr-2" />
    إنشاء متجر جديد
  </button>
</div>
```

### Success States
```jsx
// Success message
<div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
  <CheckCircle size={20} className="text-success" />
  <p className="text-success">تم الحفظ بنجاح</p>
</div>

// Toast success
toast.success('تم الحفظ', {
  icon: <Check size={20} />,
  duration: 3000,
});
```

### Disabled States
```css
/* Disabled styles */
:disabled,
.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* Aria disabled */
[aria-disabled="true"] {
  opacity: 0.4;
  cursor: not-allowed;
}
```

---

## 12. Best Practices

### Performance
- Lazy load images: `loading="lazy"`
- Code splitting: Dynamic imports
- Bundle size: < 200KB initial
- LCP target: < 2.5s
- FID target: < 100ms
- CLS target: < 0.1

### SEO
```html
<!-- Meta tags -->
<title>AI Store Builder - بناء متاجر بالذكاء الاصطناعي</title>
<meta name="description" content="..." />
<meta name="keywords" content="..." />
<meta property="og:title" content="..." />
<meta property="og:image" content="..." />

<!-- Semantic HTML -->
<header>
<nav>
<main>
<article>
<aside>
<footer>
```

### Security
- CSP headers
- HTTPS only
- Sanitize HTML output
- Rate limiting
- CORS configuration
- XSS protection
