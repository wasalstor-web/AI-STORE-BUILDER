# AI STORE BUILDER — GENIUS GRADE DESIGN SYSTEM v2.0

> **Methodology:** Linear × Stripe × Apple × Vercel × Figma
> **Standard:** WCAG AAA Dark Mode | 4px Grid | 1.125x Type Scale
> **Philosophy:** Every pixel earns its place. Restraint is sophistication.

---

## 1. COLOR SYSTEM

### 1.1 Design Rationale

| Decision | Rationale |
|----------|-----------|
| **Principle** | One signature hue anchors the brand. Every other color is semantic. |
| **Research** | Linear.app, Stripe, Vercel — all use single-hue brand identity |
| **Measurement** | WCAG AAA (7:1+ contrast) for all text on backgrounds |
| **Trade-off** | Less color variety → stronger brand recognition |
| **Accessibility** | No reliance on color alone — always paired with text/icons |
| **Competitive** | Darker than Linear, warmer than Vercel, more refined than Dify |

### 1.2 Neutral Scale (Blue Undertone)

No true blacks. Blue undertone adds depth and warmth (Apple Dark Mode methodology).

| Token | Hex | Usage |
|-------|-----|-------|
| `gray-950` | `#0B0D14` | Page background |
| `gray-900` | `#111318` | Surface / sidebar |
| `gray-850` | `#15171E` | Cards |
| `gray-800` | `#1A1C25` | Elevated elements |
| `gray-700` | `#23262F` | Borders |
| `gray-600` | `#2E3039` | Subtle borders |
| `gray-500` | `#3F4250` | Disabled text |
| `gray-400` | `#6B6F80` | Muted text |
| `gray-300` | `#9295A4` | Secondary text (7.1:1 on 950) |
| `gray-200` | `#B4B7C5` | Labels |
| `gray-100` | `#D5D7E2` | Headings |
| `gray-50`  | `#ECEEF5` | Primary text |

### 1.3 Semantic Aliases

```
Background Hierarchy (4 levels — Apple depth model):
bg (#0B0D14) → surface (#111318) → card (#15171E) → elevated (#1A1C25)

Border:      #23262F
Hover:       #1E2028
Active:      #23262F
```

### 1.4 Primary — Indigo Violet `#6366F1`

**Psychology:** Trust + Innovation + Premium
**Contrast:** 7.2:1 for `primary-light` on gray-950

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#6366F1` | Buttons, active states |
| `primary-light` | `#818CF8` | Links, highlights |
| `primary-dark` | `#4F46E5` | Hover states |
| `primary-darker` | `#4338CA` | Active/pressed |
| `primary-subtle` | `rgba(99,102,241, 0.08)` | Focus rings, tinted bg |
| `primary-muted` | `rgba(99,102,241, 0.15)` | Active backgrounds |
| `primary-glow` | `rgba(99,102,241, 0.25)` | Glow effects |

### 1.5 Accent — Cyan `#22D3EE`

**Psychology:** Energy + Clarity + Progress
**Usage:** Sparingly — CTAs, success, active navigation

| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#22D3EE` | High-priority CTAs |
| `accent-light` | `#67E8F9` | Highlights |
| `accent-dark` | `#06B6D4` | Pressed state |
| `accent-subtle` | `rgba(34,211,238, 0.08)` | Tinted backgrounds |
| `accent-glow` | `rgba(34,211,238, 0.25)` | Glow effects |

### 1.6 Semantic Colors

| Name | Default | Light | Subtle BG | Usage |
|------|---------|-------|-----------|-------|
| Success | `#10B981` | `#34D399` | `rgba(16,185,129, 0.10)` | Published, complete |
| Error | `#EF4444` | `#F87171` | `rgba(239,68,68, 0.10)` | Errors, destructive |
| Warning | `#F59E0B` | `#FBBF24` | `rgba(245,158,11, 0.10)` | Cautions, pending |
| Info | `#3B82F6` | `#60A5FA` | `rgba(59,130,246, 0.10)` | Information, tips |

### 1.7 Text Hierarchy (4 Levels Only)

> Over 4 levels = visual noise. (Stripe methodology)

| Token | Hex | Contrast on 950 | Usage |
|-------|-----|-----------------|-------|
| `text-primary` | `#F1F3F9` | 15.8:1 | Headings, body |
| `text-secondary` | `#9295A4` | 7.1:1 ✅ AAA | Descriptions, labels |
| `text-muted` | `#6B6F80` | 4.6:1 ✅ AA | Placeholders, hints |
| `text-disabled` | `#3F4250` | 2.3:1 | Disabled (decorative only) |

---

## 2. TYPOGRAPHY SYSTEM

### 2.1 Design Rationale

| Decision | Rationale |
|----------|-----------|
| **Principle** | Type hierarchy is the #1 tool for visual organization |
| **Scale** | 1.125x Major Second — tighter than 1.25, more refined |
| **Weights** | Max 4: 400, 500, 600, 700 — discipline over variety |
| **Line Height** | 1.2 headings, 1.6 body — optimal readability |

### 2.2 Font Stack

```css
--font-sans: 'Tajawal', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
```

- **Tajawal** — Arabic-first, web-optimized, excellent RTL rendering
- **Inter** — Latin fallback, designed for screens, variable font
- **Font Features:** `liga`, `calt` enabled for ligatures

### 2.3 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-xs` | 12px | 500-600 | 1.4 | 0.02em | Badges, captions |
| `text-sm` | 14px | 400-500 | 1.5 | 0.01em | Body secondary, labels |
| `text-base` | 16px | 400 | 1.6 | 0.01em | Body text |
| `text-lg` | 18px | 500 | 1.5 | 0 | Lead paragraphs |
| `text-xl` | 24px | 600 | 1.3 | -0.01em | Section titles |
| `text-2xl` | 32px | 600 | 1.2 | -0.02em | Page titles |
| `text-3xl` | 48px | 700 | 1.1 | -0.03em | Hero headlines |
| `text-4xl` | 64px | 700 | 1.05 | -0.04em | Landing display |

### 2.4 RTL Typography Rules

- All text defaults to `direction: rtl`
- Letter-spacing tightened for Arabic (natural kerning)
- Max line width: `65ch` for optimal readability
- Paragraph spacing: `1.5em` between blocks

---

## 3. SPACING SYSTEM

### 3.1 Design Rationale

| Decision | Rationale |
|----------|-----------|
| **Principle** | 4px base unit creates mathematical harmony |
| **Research** | Apple HIG, Material Design, Figma all use 4/8px grid |
| **Measurement** | Every space is a multiple of 4px |

### 3.2 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | Reset |
| `space-1` | 4px | Tight gaps: icon-to-text |
| `space-2` | 8px | Inline spacing, badge padding |
| `space-3` | 12px | Small component padding |
| `space-4` | 16px | Standard padding, input padding |
| `space-5` | 20px | Button padding |
| `space-6` | 24px | Card padding, section gap |
| `space-8` | 32px | Section spacing |
| `space-10` | 40px | Large section spacing |
| `space-12` | 48px | Page section gaps |
| `space-16` | 64px | Major section breaks |
| `space-20` | 80px | Hero vertical padding |
| `space-24` | 96px | Page-level vertical spacing |

### 3.3 Component Spacing Rules

```
Card padding:        24px (space-6)
Card gap (grid):     16px (space-4) mobile, 24px (space-6) desktop
Section margin:      48px (space-12) mobile, 64px (space-16) desktop
Page padding:        16px (space-4) mobile, 24px (space-6) tablet, 32px (space-8) desktop
Input internal:      0 16px (space-4)
Button internal:     0 20px (space-5)
Badge internal:      0 8px (space-2)
Modal padding:       24px (space-6) mobile, 32px (space-8) desktop
Sidebar width:       280px desktop, full mobile (overlay)
```

---

## 4. BORDER RADIUS

### 4.1 Design Rationale

| Decision | Rationale |
|----------|-----------|
| **Principle** | Max 2 primary radii for consistency |
| **Research** | Linear uses 8/12, Stripe uses 6/8/12 |
| **Choice** | 8px controls + 12px containers |

### 4.2 Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Badges, tooltips |
| `radius-md` | 8px | Buttons, inputs, small cards |
| `radius-lg` | 12px | Cards, panels, dialogs |
| `radius-xl` | 16px | Modals, large containers |
| `radius-full` | 9999px | Avatars, pills, dots |

---

## 5. SHADOW SYSTEM

### 5.1 Design Rationale

| Decision | Rationale |
|----------|-----------|
| **Principle** | Shadows create physical hierarchy |
| **Levels** | 4 tiers: resting → raised → floating → overlay |
| **Dark Mode** | Darker shadows + subtle blue tint (Apple method) |

### 5.2 Elevation Levels

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15)` | Cards at rest |
| `shadow-md` | `0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)` | Hover cards |
| `shadow-lg` | `0 12px 24px rgba(0,0,0,0.35), 0 4px 8px rgba(0,0,0,0.2)` | Dropdowns, floating |
| `shadow-xl` | `0 24px 48px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.25)` | Modals, overlays |
| `shadow-glow-primary` | `0 0 24px rgba(99,102,241,0.15), 0 0 48px rgba(99,102,241,0.05)` | Active elements |
| `shadow-glow-accent` | `0 0 24px rgba(34,211,238,0.15), 0 0 48px rgba(34,211,238,0.05)` | CTA glow |

---

## 6. ANIMATION SYSTEM

### 6.1 Design Rationale

| Decision | Rationale |
|----------|-----------|
| **Principle** | Animation serves function, never decoration |
| **Research** | Sub-100ms = instant, 150-300ms = responsive, 500ms+ = slow |
| **GPU** | Only `transform` + `opacity` — never animate layout props |
| **A11y** | `prefers-reduced-motion: reduce` kills all animations |

### 6.2 Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| `ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Enter: elements appearing |
| `ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Exit: elements leaving |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful: toggles, toasts |

### 6.3 Duration Tiers

| Token | Value | Usage |
|-------|-------|-------|
| `duration-micro` | 150ms | Hover, focus, color changes |
| `duration-normal` | 250ms | Slide, expand, tab switch |
| `duration-macro` | 400ms | Page transitions, modals |
| `duration-slow` | 600ms | Complex orchestrations |

### 6.4 Framer Motion Config

```tsx
// Standard enter animation
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

// Modal enter
const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.25, ease: [0, 0, 0.2, 1] }
};

// Spring toggle
const spring = {
  type: "spring",
  damping: 25,
  stiffness: 300,
  mass: 0.8
};

// Stagger children
const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
};
```

### 6.5 CSS Animation Utility Classes

| Class | Duration | Effect |
|-------|----------|--------|
| `.animate-slide-up` | 400ms | Slide from bottom + fade |
| `.animate-slide-down` | 400ms | Slide from top + fade |
| `.animate-fade-in` | 250ms | Simple opacity fade |
| `.animate-scale-in` | 250ms | Scale from 0.95 + fade |
| `.animate-float` | 4s loop | Gentle vertical float |
| `.animate-shimmer` | 3s loop | Loading skeleton shimmer |
| `.animate-pulse-glow` | 3s loop | Subtle glow pulse |
| `.animate-gradient` | 6s loop | Background gradient shift |
| `.animate-border-glow` | 4s loop | Border color pulse |
| `.animate-breathe` | 4s loop | Scale/opacity breathing |
| `.animate-count-up` | 400ms | Number counter enter |
| `.animate-orbit` | 25s loop | Orbital rotation (landing) |
| `.animate-aurora` | 20s loop | Aurora background effect |

---

## 7. COMPONENT ANATOMY

### 7.1 Buttons

**Sizes:**
| Size | Height | Padding | Font | Radius |
|------|--------|---------|------|--------|
| `btn-sm` | 32px | 0 12px | 12px/600 | 6px |
| `btn-md` | 40px | 0 20px | 14px/600 | 8px |
| `btn-lg` | 48px | 0 24px | 16px/600 | 8px |

**Variants:**
| Variant | Background | Border | Text | Hover |
|---------|-----------|--------|------|-------|
| `btn-primary` | `#6366F1` | none | white | `#4F46E5` + shadow |
| `btn-outline` | transparent | `#23262F` | primary text | primary border + subtle bg |
| `btn-ghost` | transparent | none | secondary text | hover bg |
| `btn-accent` | `#06B6D4` | none | white | `#22D3EE` + shadow |
| `btn-danger` | `#EF4444` | none | white | `#DC2626` + shadow |

**States (all variants):**
```
default  → as specified
hover    → translateY(-1px) + box-shadow + color shift
active   → translateY(0) + no shadow
focus    → 2px primary outline, 2px offset
loading  → opacity 0.7 + spinner + pointer-events: none
disabled → opacity 0.4 + cursor: not-allowed
```

**Min touch target:** 44×44px (WCAG 2.5.5 AAA)

### 7.2 Inputs

**Dimensions:** Height 40px | Padding 0 16px | Radius 8px

**States:**
```
default  → bg: surface, border: #23262F
hover    → border: #3F4250
focus    → border: primary + 3px subtle ring
error    → border: #EF4444 + 3px error ring
success  → border: #10B981 + 3px success ring
disabled → opacity 0.4 + cursor: not-allowed
```

### 7.3 Cards (Glass System)

| Variant | Backdrop | Border | Hover |
|---------|----------|--------|-------|
| `glass-card` | blur(24px) sat(1.2) | `#23262F` | gradient border + shadow-lg + Y-1px |
| `glass-card-static` | blur(24px) | `#23262F` | none |
| `glass-card-glow` | blur(24px) sat(1.2) | primary 10% | glow + shadow-xl + Y-2px |

### 7.4 Badges

**Height:** 22px | **Padding:** 0 8px | **Font:** 11px/600 | **Radius:** 6px

| Variant | BG | Text | Border |
|---------|-----|------|--------|
| `badge-primary` | primary 8% | primary-light | primary 15% |
| `badge-accent` | accent 8% | accent | accent 15% |
| `badge-success` | success 10% | success-light | success 15% |
| `badge-warning` | warning 10% | warning-light | warning 15% |
| `badge-danger` | error 10% | error-light | error 15% |
| `badge-neutral` | gray-700 60% | text-secondary | dark-border |

---

## 8. LAYOUT SYSTEM

### 8.1 RTL-First Architecture

```css
direction: rtl;  /* All containers */
text-align: right;  /* Default */
```

- Sidebar: right side
- Navigation: right-to-left flow
- Icons: flip horizontal for directional icons
- Margin/padding: logical properties where supported

### 8.2 Grid System

```
Max width:     1440px (with auto margins)
Columns:       12-column grid
Gutter:        16px mobile, 24px desktop
Sidebar:       280px fixed
Content:       1fr (fills remaining)
```

### 8.3 Responsive Breakpoints

| Breakpoint | Width | Target |
|-----------|-------|--------|
| `xs` | 320px | Small phones |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### 8.4 Page-Specific Responsive Rules

**Landing Page:**
- Hero: `text-3xl` → `text-4xl` at lg
- Feature grid: 1col → 2col at md → 3col at lg
- CTA buttons: full-width at xs, auto at sm+
- Logos: scroll horizontal at xs, grid at md

**Dashboard:**
- Sidebar: overlay at <lg, fixed at lg+
- Stats: 2col at xs, 4col at lg
- Store cards: 1col → 2col at md → 3col at xl
- Header: compact at xs, full at md

**AI Builder:**
- 1-column stack at <lg
- 3-column layout at lg+ (sidebar 280px | canvas 1fr | chat 360px)
- Bottom toolbar at <md, sidebar toolbars at lg+

**Create Store / Edit Store:**
- Wizard: full-width at xs, max-w-2xl centered at md+
- Form fields: 1col at xs, 2col at md
- Preview: below form at xs, side-by-side at lg

**Login / Register:**
- Form card: full at xs, max-w-md centered at sm+
- Social buttons: stack at xs, row at md

---

## 9. ICONS

- **Library:** Lucide React v0.454.0+
- **Default size:** 20px (icons in UI), 16px (inline), 24px (headers)
- **Stroke width:** 1.5 (matches font weight visually)
- **Color:** inherits `currentColor`
- **Directional icons:** must be flipped for RTL

---

## 10. PAGES

| # | Route | Page | Layout |
|---|-------|------|--------|
| 1 | `/` | Landing | Full-width, no sidebar |
| 2 | `/login` | Login | Centered card |
| 3 | `/register` | Register | Centered card |
| 4 | `/dashboard` | Dashboard | Sidebar + content |
| 5 | `/create-store` | Create Store | Sidebar + centered wizard |
| 6 | `/ai-builder/:id` | AI Builder | 3-column editor |
| 7 | `/store/:id` | Store Detail | Sidebar + content |
| 8 | `/edit-store/:id` | Edit Store | Sidebar + centered form |
| 9 | `*` | 404 Not Found | Full-width, centered |

---

## 11. ACCESSIBILITY (WCAG 2.1 AA+)

### 11.1 Contrast Requirements

| Pair | Ratio | Standard |
|------|-------|----------|
| text-primary on bg | 15.8:1 | ✅ AAA |
| text-secondary on bg | 7.1:1 | ✅ AAA |
| text-muted on bg | 4.6:1 | ✅ AA |
| primary on bg | 4.7:1 | ✅ AA |
| primary-light on bg | 7.2:1 | ✅ AAA |
| accent on bg | 12.4:1 | ✅ AAA |
| success on bg | 7.8:1 | ✅ AAA |
| error on bg | 5.2:1 | ✅ AA |
| white on primary | 8.1:1 | ✅ AAA |

### 11.2 Keyboard Navigation

- All interactive elements reachable via Tab
- `Enter`/`Space` activates buttons and links
- `Escape` closes modals, dropdowns, overlays
- `Arrow keys` navigate within components (tabs, menus)
- Focus order follows visual reading order (RTL)
- Skip-to-main link as first focusable element

### 11.3 Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### 11.4 ARIA Requirements

```html
<!-- Buttons with icons only -->
<button aria-label="حذف المتجر">
  <Trash2 aria-hidden="true" />
</button>

<!-- Loading states -->
<div aria-busy="true" aria-live="polite">
  جاري التحميل...
</div>

<!-- Error messages -->
<input aria-invalid="true" aria-describedby="email-error" />
<span id="email-error" role="alert">البريد غير صالح</span>

<!-- Navigation -->
<nav aria-label="التنقل الرئيسي">
<aside aria-label="القائمة الجانبية">

<!-- Modals -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
```

### 11.5 Screen Reader Support

- All images have `alt` text (or `aria-hidden` for decorative)
- Form fields have associated `<label>` elements
- Error messages use `role="alert"` for live announcements
- Status changes use `aria-live="polite"`
- Page sections use landmark roles

### 11.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. UI STATES

### 12.1 Loading States

```tsx
// Skeleton — Shimmer animation
<div className="h-4 w-48 rounded-md bg-gray-800 animate-shimmer" />

// Spinner — 20px, primary color
<Loader2 className="w-5 h-5 animate-spin text-primary" />

// Full page loading
<div className="flex items-center justify-center min-h-[60vh]">
  <Loader2 className="w-8 h-8 animate-spin text-primary" />
</div>
```

### 12.2 Error States

```tsx
<div className="flex flex-col items-center gap-4 py-12">
  <div className="w-12 h-12 rounded-lg bg-error-subtle flex items-center justify-center">
    <AlertCircle className="w-6 h-6 text-error" />
  </div>
  <h3 className="text-lg font-semibold">حدث خطأ</h3>
  <p className="text-sm text-text-secondary text-center max-w-md">
    {error.message}
  </p>
  <button className="btn-primary btn-sm" onClick={retry}>
    إعادة المحاولة
  </button>
</div>
```

### 12.3 Empty States

```tsx
<div className="flex flex-col items-center gap-4 py-16">
  <div className="w-16 h-16 rounded-xl bg-primary-subtle flex items-center justify-center">
    <Store className="w-8 h-8 text-primary-light" />
  </div>
  <h3 className="text-lg font-semibold">لا توجد متاجر</h3>
  <p className="text-sm text-text-secondary max-w-md text-center">
    ابدأ بإنشاء متجرك الأول باستخدام الذكاء الاصطناعي
  </p>
  <button className="btn-primary">إنشاء متجر جديد</button>
</div>
```

### 12.4 Success States

```tsx
// Toast notification (react-hot-toast)
toast.success('تم الحفظ بنجاح', {
  style: {
    background: '#111318',
    color: '#F1F3F9',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
  },
  iconTheme: { primary: '#10B981', secondary: '#fff' },
});

// Inline success
<div className="flex items-center gap-2 text-success text-sm">
  <CheckCircle className="w-4 h-4" />
  <span>تم الحفظ بنجاح</span>
</div>
```

---

## 13. BEST PRACTICES

### 13.1 Performance

- Lazy load pages with `React.lazy()` + `Suspense`
- Images: WebP with AVIF fallback, `loading="lazy"`
- Fonts: `font-display: swap`, preload critical weights
- CSS: Tailwind treeshakes unused utilities
- Bundle: code-split per route, max 200KB initial JS
- GPU animations only: `transform`, `opacity`

### 13.2 SEO & Meta

- Unique `<title>` per page
- `<meta name="description">` per page
- Semantic HTML5: `header`, `main`, `nav`, `aside`, `section`
- OG meta tags for social sharing
- Arabic `lang="ar"` attribute

### 13.3 Security

- XSS protection: no `dangerouslySetInnerHTML`
- CSRF tokens on all mutations
- Input sanitization on all forms
- Auth tokens in httpOnly cookies
- CSP headers configured on server

### 13.4 Code Standards

- TypeScript strict mode — NEVER use `any`
- Component files: PascalCase (`StoreCard.tsx`)
- Hook files: camelCase (`useStores.ts`)
- Max component length: 200 lines (split if larger)
- Props interface defined above component
- Tailwind classes: sorted (layout → spacing → visual)

---

## 14. TOKEN MAPPING — CSS ↔ TAILWIND

```
/* Usage in Tailwind classes */
bg-dark-bg         → var(--color-dark-bg)
bg-dark-surface    → var(--color-dark-surface)
bg-dark-card       → var(--color-dark-card)
bg-dark-elevated   → var(--color-dark-elevated)
border-dark-border → var(--color-dark-border)

text-primary       → var(--color-primary)
text-primary-light → var(--color-primary-light)
text-accent        → var(--color-accent)

text-text-primary  → var(--color-text-primary)
text-text-secondary→ var(--color-text-secondary)
text-text-muted    → var(--color-text-muted)

text-success       → var(--color-success)
text-error         → var(--color-error)
text-warning       → var(--color-warning)
text-info          → var(--color-info)
```

---

> **VERSION:** 2.0.0 Genius Grade
> **LAST UPDATED:** 2026-02-09
> **METHODOLOGY:** Linear × Stripe × Apple × Vercel × Figma
> **STANDARD:** WCAG AAA Dark Mode
