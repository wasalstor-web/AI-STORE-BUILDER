# AI STORE BUILDER — COMPONENT SPECIFICATIONS v2.0

> **Standard:** Genius Grade | TypeScript Strict | WCAG AAA
> **Framework:** React 19 + Tailwind CSS v4 + Framer Motion
> **Icons:** Lucide React | **Font:** Tajawal + Inter

---

## 1. GlassCard

### Props Interface

```tsx
interface GlassCardProps {
  children: React.ReactNode;
  variant?: "default" | "static" | "glow";
  padding?: "sm" | "md" | "lg";
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
  role?: string;
  "aria-label"?: string;
}
```

### Variants

```tsx
// Default — hover effect with gradient border
<GlassCard variant="default" padding="md">
  <h3>محتوى البطاقة</h3>
</GlassCard>

// Static — no interaction
<GlassCard variant="static" padding="lg">
  <p>محتوى ثابت</p>
</GlassCard>

// Glow — primary glow border, elevated
<GlassCard variant="glow" padding="md" onClick={handleClick}>
  <p>بطاقة متوهجة</p>
</GlassCard>
```

### Styles

| Property   | Default                             | Static                | Glow                     |
| ---------- | ----------------------------------- | --------------------- | ------------------------ |
| Background | gradient 145deg card/surface        | gradient card/surface | gradient card/surface    |
| Backdrop   | blur(24px) sat(1.2)                 | blur(24px)            | blur(24px) sat(1.2)      |
| Border     | gray-700                            | gray-700              | primary 10%              |
| Radius     | 12px                                | 12px                  | 12px                     |
| Hover      | gradient border + shadow-lg + Y-1px | none                  | glow + shadow-xl + Y-2px |
| Padding sm | 16px                                | 16px                  | 16px                     |
| Padding md | 24px                                | 24px                  | 24px                     |
| Padding lg | 32px                                | 32px                  | 32px                     |

### Accessibility

- `role="button"` when `onClick` is provided
- `tabIndex={0}` when interactive
- `aria-label` required when no visible text
- Focus: 2px primary outline, 2px offset

### Usage Locations

- Dashboard: store cards, stat cards
- AI Builder: section cards, template cards
- Store Detail: info sections
- Landing: feature cards, pricing cards

---

## 2. Button

### Props Interface

```tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
}
```

### Variants

```tsx
<Button variant="primary" size="md">إنشاء متجر</Button>
<Button variant="outline" icon={<Plus />}>إضافة</Button>
<Button variant="ghost" size="sm">إلغاء</Button>
<Button variant="accent" size="lg">ابدأ الآن</Button>
<Button variant="danger" loading>حذف</Button>
```

### Sizes

| Size | Height | Padding | Font     | Radius |
| ---- | ------ | ------- | -------- | ------ |
| sm   | 32px   | 0 12px  | 12px/600 | 6px    |
| md   | 40px   | 0 20px  | 14px/600 | 8px    |
| lg   | 48px   | 0 24px  | 16px/600 | 8px    |

### States

| State    | Transform | Shadow           | Opacity | Cursor      |
| -------- | --------- | ---------------- | ------- | ----------- |
| Default  | none      | variant-specific | 1       | pointer     |
| Hover    | Y(-1px)   | elevated         | 1       | pointer     |
| Active   | Y(0)      | none             | 1       | pointer     |
| Focus    | none      | none + outline   | 1       | pointer     |
| Loading  | none      | variant          | 0.7     | wait        |
| Disabled | none      | none             | 0.4     | not-allowed |

### Accessibility

- Min touch target: 44×44px
- `aria-label` required for icon-only buttons
- `aria-busy="true"` during loading
- `aria-disabled="true"` when disabled
- Focus: 2px primary outline, 2px offset
- Enter/Space activates

### Usage Locations

- All pages — primary actions, navigation, forms

---

## 3. Input

### Props Interface

```tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "search" | "url";
  error?: string;
  success?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
  required?: boolean;
  id: string;
  className?: string;
  dir?: "rtl" | "ltr";
}
```

### Variants

```tsx
<Input id="store-name" label="اسم المتجر" value={name} onChange={setName} required />
<Input id="email" type="email" error="البريد غير صالح" value={email} onChange={setEmail} />
<Input id="search" type="search" icon={<Search />} placeholder="بحث..." value={q} onChange={setQ} />
<Input id="url" type="url" dir="ltr" success value={url} onChange={setUrl} />
```

### States

| State    | Border   | Shadow                  | Background         |
| -------- | -------- | ----------------------- | ------------------ |
| Default  | gray-700 | none                    | surface            |
| Hover    | gray-500 | none                    | surface            |
| Focus    | primary  | 3px primary-subtle ring | bg                 |
| Error    | error    | 3px error-subtle ring   | surface            |
| Success  | success  | 3px success-subtle ring | surface            |
| Disabled | gray-700 | none                    | card (0.4 opacity) |

### Accessibility

- Associated `<label>` via `htmlFor`/`id`
- `aria-invalid="true"` on error
- `aria-describedby` pointing to error/helper text
- `aria-required="true"` when required
- Error messages use `role="alert"`

### Usage Locations

- Login/Register: email, password
- Create Store/Edit Store: all form fields
- AI Builder: chat input, search
- Dashboard: search bar

---

## 4. Modal

### Props Interface

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  showClose?: boolean;
  footer?: React.ReactNode;
  "aria-describedby"?: string;
}
```

### Variants

```tsx
<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="حذف المتجر"
  size="sm"
>
  <p>هل أنت متأكد من حذف هذا المتجر؟</p>
  <div className="flex gap-3 mt-6">
    <Button variant="danger" onClick={handleDelete}>
      حذف
    </Button>
    <Button variant="outline" onClick={() => setOpen(false)}>
      إلغاء
    </Button>
  </div>
</Modal>
```

### Sizes

| Size | Max Width | Padding |
| ---- | --------- | ------- |
| sm   | 400px     | 24px    |
| md   | 560px     | 32px    |
| lg   | 720px     | 32px    |

### Animation

```tsx
// Backdrop: fade 250ms
// Content: scale(0.95) + fade → scale(1) + visible, 250ms ease-decelerate
```

### Styles

- Background: glass-card with blur(24px)
- Border: gray-700
- Radius: 16px (radius-xl)
- Shadow: shadow-xl
- Overlay: rgba(0, 0, 0, 0.6) + blur(4px)

### Accessibility

- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` → title element
- Focus trap inside modal
- Escape closes modal
- Returns focus to trigger on close
- Body scroll locked

### Usage Locations

- Dashboard: delete confirmation, store settings
- AI Builder: save confirmation, template picker
- Store Detail: action confirmations

---

## 5. Toast

### Props Interface

```tsx
interface ToastConfig {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number; // default: 4000ms
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### Styles

```tsx
const toastStyle = {
  background: "#111318", // surface
  color: "#F1F3F9", // text-primary
  border: "1px solid", // semantic border color
  borderRadius: "8px",
  fontSize: "14px",
  fontFamily: "var(--font-sans)",
  direction: "rtl" as const,
};
```

### Animation

- Enter: slide-up + fade, 300ms ease-decelerate
- Exit: fade + slide-up, 200ms ease-accelerate

### Variants

| Type    | Border Color | Icon                    |
| ------- | ------------ | ----------------------- |
| Success | success 20%  | CheckCircle (success)   |
| Error   | error 20%    | AlertCircle (error)     |
| Warning | warning 20%  | AlertTriangle (warning) |
| Info    | info 20%     | Info (info)             |

### Accessibility

- `role="status"` + `aria-live="polite"` for info/success
- `role="alert"` + `aria-live="assertive"` for error/warning

### Usage Locations

- All pages — feedback after actions

---

## 6. Sidebar

### Props Interface

```tsx
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}
```

### Layout

```
Width:     280px (fixed, desktop)
           Full-width overlay (mobile <1024px)
Position:  Right side (RTL)
Background: surface (#111318)
Border:    1px left border (#23262F)
```

### Sections

1. **Logo + Brand** — top, 64px height
2. **Navigation** — main menu items, icon + label
3. **Footer** — user profile, settings, logout

### Navigation Item States

| State   | Background     | Text           | Left Border         |
| ------- | -------------- | -------------- | ------------------- |
| Default | transparent    | text-secondary | none                |
| Hover   | dark-hover     | text-primary   | none                |
| Active  | primary-subtle | primary-light  | 2px primary         |
| Focus   | transparent    | text-primary   | 2px primary outline |

### Animation (Mobile)

- Enter: slide from right, 300ms ease-decelerate
- Exit: slide to right, 200ms ease-accelerate
- Overlay: fade in/out, 250ms

### Accessibility

- `<aside>` with `aria-label="القائمة الجانبية"`
- `<nav>` with `aria-label="التنقل الرئيسي"`
- Mobile: `role="dialog"` + `aria-modal="true"`
- Focus trap when open on mobile
- Escape closes mobile sidebar

### Usage Locations

- Dashboard, Create Store, Store Detail, Edit Store

---

## 7. StatsCard

### Props Interface

```tsx
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "primary" | "accent" | "success" | "warning";
}
```

### Variant

```tsx
<StatsCard
  label="إجمالي المتاجر"
  value={42}
  icon={<Store />}
  trend={{ value: 12, direction: "up" }}
  color="primary"
/>
```

### Styles

- Base: `glass-card` variant with padding 24px
- Icon container: 40×40px, rounded-lg, semantic bg
- Value: text-2xl (32px), font-bold, text-primary
- Label: text-sm (14px), text-secondary
- Trend up: text-success + ArrowUp icon
- Trend down: text-error + ArrowDown icon

### Animation

- Value: `animate-count-up` on mount
- Card: stagger entrance with siblings

### Usage Locations

- Dashboard: top stats row

---

## 8. EmptyState

### Props Interface

```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "accent";
  };
}
```

### Styles

- Layout: flex column, centered, gap-4
- Icon container: 64×64px, rounded-xl, primary-subtle bg
- Icon: 32×32px, primary-light color
- Title: text-lg (18px), font-semibold
- Description: text-sm (14px), text-secondary, max-w-md, centered
- Padding: 64px vertical

### Usage Locations

- Dashboard: no stores
- AI Builder: empty canvas
- Store Detail: no products/orders

---

## 9. LoadingSkeleton

### Props Interface

```tsx
interface SkeletonProps {
  variant?: "text" | "card" | "avatar" | "button";
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}
```

### Styles

- Background: gray-800 (#1A1C25)
- Animation: shimmer (3s, infinite)
- Radius: same as target element
- Height (text): 16px
- Height (card): full card dimensions
- Height (avatar): 40×40px circle
- Height (button): 40px

### Accessibility

- `aria-hidden="true"` (decorative)
- Parent: `aria-busy="true"` + `aria-live="polite"`

### Usage Locations

- All pages during data loading

---

## 10. Dropdown

### Props Interface

```tsx
interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  width?: number;
}

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  separator?: boolean;
}
```

### Styles

- Background: surface (#111318)
- Border: gray-700
- Radius: 12px (radius-lg)
- Shadow: shadow-lg
- Item height: 36px
- Item padding: 0 12px
- Item hover: dark-hover
- Danger item: text-error on hover

### Animation

- Enter: scale-in from origin, 200ms ease-decelerate
- Exit: fade + scale(0.95), 150ms ease-accelerate

### Accessibility

- `role="menu"` on container
- `role="menuitem"` on items
- Arrow keys navigate items
- Enter/Space activates
- Escape closes

### Usage Locations

- Dashboard: store card actions
- AI Builder: section options
- Header: user menu

---

## 11. TabNavigation

### Props Interface

```tsx
interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "underline" | "pills";
}

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}
```

### Variants

**Underline (default):**

- Active: text-primary + 2px primary bottom border
- Inactive: text-secondary, no border
- Hover: text-primary

**Pills:**

- Active: primary-subtle bg + primary-light text
- Inactive: transparent + text-secondary
- Hover: dark-hover bg

### Styles

- Height: 40px
- Gap: 4px (pills), 0 (underline)
- Font: 14px/500
- Transition: 150ms standard

### Accessibility

- `role="tablist"` on container
- `role="tab"` on each tab
- `aria-selected` on active
- `aria-controls` links to panel
- Arrow keys navigate tabs

### Usage Locations

- Store Detail: overview/products/orders/settings
- AI Builder: sections/templates/settings
- Dashboard: all stores/active/draft

---

## 12. ProgressWizard

### Props Interface

```tsx
interface ProgressWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

interface WizardStep {
  label: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
}
```

### Styles

- Layout: horizontal with connecting lines
- Step circle: 32×32px, rounded-full
- Completed: primary bg + Check icon (white)
- Current: primary border + primary number
- Upcoming: gray-700 bg + gray-400 number
- Line: 2px, primary (completed) / gray-700 (upcoming)
- Label: 14px/500 below circle
- Description: 12px/400 text-muted

### Accessibility

- `aria-label="خطوات الإنشاء"`
- Each step: `aria-current="step"` for current
- Completed steps: clickable with `role="button"`

### Usage Locations

- Create Store: 3-step wizard

---

## 13. DeviceSwitcher (AI Builder)

### Props Interface

```tsx
interface DeviceSwitcherProps {
  activeDevice: "mobile" | "tablet" | "desktop";
  onChange: (device: "mobile" | "tablet" | "desktop") => void;
}
```

### Styles

- Container: pills bg (gray-800), rounded-md, p-1
- Active: primary-subtle bg, primary-light text
- Inactive: transparent, text-muted
- Icon size: 16px
- Transition: 150ms

### Device Widths (Canvas)

| Device  | Width | Icon       |
| ------- | ----- | ---------- |
| Mobile  | 375px | Smartphone |
| Tablet  | 768px | Tablet     |
| Desktop | 100%  | Monitor    |

### Usage Locations

- AI Builder: canvas toolbar

---

## 14. Timeline

### Props Interface

```tsx
interface TimelineProps {
  items: TimelineItem[];
}

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  status?: "completed" | "active" | "pending";
}
```

### Styles

- Vertical line: 2px, gray-700, right side (RTL)
- Dot: 8px circle on line
- Completed dot: primary, filled
- Active dot: primary + glow ring
- Pending dot: gray-600, outlined
- Content: right of line, 16px gap

### Usage Locations

- AI Builder: generation progress
- Store Detail: activity log

---

## 15. SearchInput

### Props Interface

```tsx
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  loading?: boolean;
  shortcut?: string;
}
```

### Styles

- Base: input-field + Search icon (right side RTL)
- Height: 40px
- Icon: 16px, text-muted
- Clear button: X icon, appears when value is present
- Loading: replace search icon with Loader2 spinner
- Shortcut badge: keyboard shortcut hint (right/left)

### Keyboard

- `Cmd/Ctrl + K` focuses search
- `Escape` clears and blurs
- Debounce: 300ms

### Usage Locations

- Dashboard: store search
- AI Builder: section/template search

---

## 16. Avatar

### Props Interface

```tsx
interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline" | "busy";
}
```

### Sizes

| Size | Dimensions | Font |
| ---- | ---------- | ---- |
| sm   | 28×28px    | 11px |
| md   | 36×36px    | 14px |
| lg   | 48×48px    | 18px |

### Styles

- Shape: circle (radius-full)
- Fallback: first letter of name, primary-subtle bg, primary-light text
- Status dot: 8px circle, bottom-left
- Online: success color
- Offline: gray-500
- Busy: warning color

### Usage Locations

- Sidebar: user profile
- Header: user avatar
- AI Builder: chat messages

---

## TOKEN QUICK REFERENCE

```
Colors:     6366F1 (primary) | 22D3EE (accent) | 0B0D14 (bg)
Text:       F1F3F9 / 9295A4 / 6B6F80 / 3F4250
Semantic:   10B981 / EF4444 / F59E0B / 3B82F6
Radius:     6 / 8 / 12 / 16 / 9999
Shadows:    sm / md / lg / xl / glow-primary / glow-accent
Duration:   150ms / 250ms / 400ms / 600ms
Spacing:    4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96
```

---

> **VERSION:** 2.0.0 Genius Grade
> **COMPONENTS:** 16 total
> **LAST UPDATED:** 2026-02-09
