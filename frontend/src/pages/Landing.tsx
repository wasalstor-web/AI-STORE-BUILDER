import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Shield,
  ArrowLeft,
  Palette,
  Layers,
  Bot,
  CheckCircle,
  Star,
  Eye,
  Code2,
  Rocket,
  Smartphone,
  Monitor,
  GripVertical,
  Wand2,
  MessageSquare,
  ChevronLeft,
  Package,
  ArrowUpRight,
  Play,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  STORE_TEMPLATES,
  getTemplateHTML,
  type StoreTemplate,
} from "../data/templates";
import AppBackdrop from "../components/graphics/AppBackdrop";

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */

const pricingPlans = [
  {
    name: "مجاني",
    price: "0",
    period: "ر.س / شهرياً",
    cta: "ابدأ مجاناً",
    popular: false,
    icon: Rocket,
    features: ["متجر واحد", "5 صفحات", "قوالب أساسية", "دعم المجتمع"],
  },
  {
    name: "احترافي",
    price: "49",
    period: "ر.س / شهرياً",
    cta: "جرّب الآن",
    popular: true,
    icon: Sparkles,
    features: [
      "5 متاجر",
      "صفحات غير محدودة",
      "كل القوالب",
      "ذكاء اصطناعي متقدم",
      "نطاق مخصص",
      "أولوية الدعم",
    ],
  },
  {
    name: "أعمال",
    price: "149",
    period: "ر.س / شهرياً",
    cta: "تواصل معنا",
    popular: false,
    icon: Shield,
    features: [
      "متاجر غير محدودة",
      "كل المميزات",
      "API كامل",
      "دعم مخصص 24/7",
      "تدريب الفريق",
    ],
  },
];

const features = [
  {
    icon: Bot,
    title: "بناء بالذكاء الاصطناعي",
    desc: "اوصف مشروعك والذكاء الاصطناعي يبني لك تصميم كامل — يفهم العربي 100%",
    gradient: "from-violet-500 to-purple-600",
    badge: "الأقوى",
  },
  {
    icon: Layers,
    title: "21+ قسم سحب وإفلات",
    desc: "أقسام جاهزة: بطل، منتجات، تقييمات، عروض، عداد، FAQ وأكثر",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Palette,
    title: "12 قالب احترافي",
    desc: "أزياء، إلكترونيات، مطاعم، محافظ أعمال، عقارات — 16 نوع مشروع",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Code2,
    title: "تصدير HTML كامل",
    desc: "حمّل تصميم موقعك كملف HTML جاهز — ملكك تنشره وين ما تبي",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Shield,
    title: "متجاوب 100%",
    desc: "يشتغل بكمال على الجوال، التابلت، والكمبيوتر — مع RTL ودعم عربي كامل",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Zap,
    title: "سرعة خارقة",
    desc: "كود نظيف وخفيف — موقعك يحمّل في أقل من ثانية",
    gradient: "from-rose-500 to-pink-600",
  },
];

const testimonials = [
  {
    name: "سارة المالكي",
    role: "صاحبة متجر أزياء",
    text: 'كتبت "أبي متجر أزياء فاخر" وطلع لي تصميم أحلى من اللي يسويه المصممين! مستحيل أرجع للطريقة القديمة.',
    stars: 5,
  },
  {
    name: "محمد العتيبي",
    role: "متجر إلكترونيات",
    text: "القوالب الجاهزة خرافية — اخترت قالب وعدلت بالذكاء الاصطناعي وخلّص كل شي في 5 دقائق.",
    stars: 5,
  },
  {
    name: "نورة القحطاني",
    role: "متجر مستحضرات",
    text: "أفضل منصة جربتها — السحب والإفلات سهل جداً والنتيجة احترافية فعلاً. أنصح فيها بقوة.",
    stars: 5,
  },
  {
    name: "خالد الدوسري",
    role: "متجر عطور",
    text: "ميزة البناء بالذكاء الاصطناعي غيرت كل شي — أقول له أضف قسم عروض ويضيفه يبيله ثواني بس.",
    stars: 5,
  },
];

const steps = [
  {
    num: "01",
    title: "سمّ مشروعك",
    desc: "اكتب اسم مشروعك واختر نوعه من 16 تخصص",
    icon: MessageSquare,
  },
  {
    num: "02",
    title: "اختر أو ابنِ",
    desc: "اختر قالب جاهز أو خلّ الذكاء الاصطناعي يبني لك",
    icon: Wand2,
  },
  {
    num: "03",
    title: "خصّص وانشر",
    desc: "عدّل بالسحب والإفلات أو بالشات ثم انشر بضغطة",
    icon: Rocket,
  },
];

const logos = ["Moyasar", "Tap", "Aramex", "SMSA", "STC Pay"];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

/* ═══════════════════════════════════════
   COMPONENT: Template Showcase
   ═══════════════════════════════════════ */
function TemplateShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTemplate, setActiveTemplate] = useState<StoreTemplate | null>(
    null,
  );
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const showcaseTemplates = STORE_TEMPLATES.slice(0, 8);

  useEffect(() => {
    if (activeTemplate && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(getTemplateHTML(activeTemplate.id, activeTemplate.name));
        doc.close();
      }
    }
  }, [activeTemplate, previewDevice]);

  return (
    <>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto no-scrollbar pb-6 px-1"
      >
        {showcaseTemplates.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: i * 0.06,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="shrink-0 w-[280px] rounded-2xl overflow-hidden border border-dark-border/60 bg-dark-card/50 cursor-pointer group transition-all duration-300 hover:border-primary/25 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
            onClick={() => setActiveTemplate(t)}
          >
            <div
              className="h-40 relative overflow-hidden"
              style={{ background: t.thumbnail }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-dark-bg/90 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-[2px]">
                <span className="flex items-center gap-2 text-white text-sm font-medium bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                  <Play className="w-3.5 h-3.5" />
                  معاينة حية
                </span>
              </div>
              <div className="absolute bottom-3 right-4 left-4">
                <p className="font-bold text-white text-sm">{t.name}</p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {t.description.slice(0, 45)}...
                </p>
              </div>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ background: t.primaryColor }}
                />
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ background: t.accentColor }}
                />
              </div>
              <span className="text-[10px] text-text-muted bg-dark-hover/60 px-2.5 py-1 rounded-lg">
                {t.sections.length} قسم
              </span>
            </div>
          </motion.div>
        ))}
        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="shrink-0 w-[280px] rounded-2xl border border-dashed border-primary/20 bg-primary/3 flex items-center justify-center p-8"
        >
          <Link to="/register" className="text-center group">
            <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/12 group-hover:scale-105 transition-all duration-300">
              <ArrowUpRight className="w-6 h-6 text-primary-light" />
            </div>
            <p className="font-bold text-sm mb-1">شوف الكل</p>
            <p className="text-[11px] text-text-muted">12 قالب احترافي</p>
          </Link>
        </motion.div>
      </div>

      {/* Live Preview Modal */}
      {activeTemplate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={() => setActiveTemplate(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-dark-surface rounded-2xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col border border-dark-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-dark-border shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl shrink-0"
                  style={{ background: activeTemplate.thumbnail }}
                />
                <div>
                  <h3 className="font-bold text-sm">{activeTemplate.name}</h3>
                  <p className="text-[11px] text-text-muted">
                    {activeTemplate.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-dark-bg rounded-lg p-0.5 border border-dark-border">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md transition-all ${previewDevice === "desktop" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text-secondary"}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md transition-all ${previewDevice === "mobile" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text-secondary"}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Link
                  to="/register"
                  className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
                >
                  ابنِ بهذا القالب
                  <ChevronLeft className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => setActiveTemplate(null)}
                  className="p-2 rounded-lg hover:bg-dark-hover text-text-muted transition-colors text-lg leading-none"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-neutral-100 flex items-start justify-center p-6">
              <div
                className="bg-white rounded-xl overflow-hidden shadow-2xl h-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: previewDevice === "mobile" ? "375px" : "100%" }}
              >
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="Preview"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════ */
export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "ويب فلو | بناء المواقع بالذكاء الاصطناعي";
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg">
      <AppBackdrop variant="marketing" intensity="max" />

      {/* ── Header (Stripe-inspired sticky nav) ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#08090d]/80 backdrop-blur-2xl border-b border-white/4">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              ويب فلو
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-text-secondary">
            <a
              href="#features"
              className="hover:text-text-primary transition-colors duration-200"
            >
              المميزات
            </a>
            <a
              href="#templates"
              className="hover:text-text-primary transition-colors duration-200"
            >
              القوالب
            </a>
            <a
              href="#pricing"
              className="hover:text-text-primary transition-colors duration-200"
            >
              الأسعار
            </a>
            <a
              href="#reviews"
              className="hover:text-text-primary transition-colors duration-200"
            >
              آراء العملاء
            </a>
          </nav>
          <div className="flex items-center gap-2.5">
            {/* Hamburger button – mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <Link
              to="/login"
              className="hidden sm:inline text-[13px] text-white/50 hover:text-white/80 transition-colors px-3 py-1.5"
            >
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="text-[13px] px-4 py-1.5 rounded-lg bg-linear-to-r from-violet-600 to-blue-600 text-white font-medium hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-600/20"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>

        {/* ── Mobile Nav Menu ── */}
        <motion.div
          initial={false}
          animate={{
            height: mobileMenuOpen ? "auto" : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="md:hidden overflow-hidden border-t border-white/5"
        >
          <nav className="flex flex-col gap-1 px-6 py-4 text-sm">
            {[
              { href: "#features", label: "المميزات" },
              { href: "#templates", label: "القوالب" },
              { href: "#pricing", label: "الأسعار" },
              { href: "#reviews", label: "آراء العملاء" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="sm:hidden py-2.5 px-3 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              تسجيل الدخول
            </Link>
          </nav>
        </motion.div>
      </header>

      {/* ── Hero Section (Apple + Stripe inspired) ── */}
      <section className="pt-36 pb-20 px-6 relative overflow-hidden">
        {/* Background: subtle aurora */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-600/7 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute top-40 right-[15%] w-[400px] h-[400px] bg-blue-500/4 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-0 left-[20%] w-[300px] h-[300px] bg-violet-500/3 rounded-full blur-[100px] pointer-events-none" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/4 border border-white/6 text-[13px] text-text-secondary mb-10 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              منصة بناء المواقع والمتاجر بالذكاء الاصطناعي — v2.5
            </motion.div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.1] mb-7 tracking-tight">
              <span className="block text-white/95">ابنِ موقعك</span>
              <span className="block bg-linear-to-r from-violet-400 via-blue-400 to-violet-400 bg-clip-text text-transparent mt-2">
                بقوة الذكاء الاصطناعي
              </span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
              متجر، موقع شركة، محفظة أعمال، مدونة، مطعم — اوصف مشروعك وWebFlow
              AI يبنيه لك في دقائق.{" "}
              <span className="text-text-primary font-medium">
                16 نوع مشروع • قوالب جاهزة • كل شي بالعربي
              </span>
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/register"
                className="text-base px-8 py-4 flex items-center gap-2.5 rounded-xl bg-linear-to-r from-violet-600 to-blue-600 text-white font-semibold hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98]"
              >
                <Rocket className="w-5 h-5" />
                ابدأ بناء موقعك — مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <a
                href="#templates"
                className="text-base px-8 py-4 flex items-center gap-2.5 rounded-xl border border-white/8 text-white/70 hover:bg-white/4 hover:text-white/90 transition-all"
              >
                <Eye className="w-5 h-5" />
                شوف القوالب
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-10 flex-wrap">
              {[
                { value: "12", label: "قالب احترافي", icon: Palette },
                { value: "21+", label: "قسم جاهز", icon: Layers },
                { value: "16", label: "نوع مشروع", icon: Package },
                { value: "∞", label: "تخصيص AI", icon: Bot },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-text-muted" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-text-primary block leading-tight text-lg">
                      {s.value}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Visual: Builder Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-white/6 bg-dark-card/40 p-1 shadow-2xl shadow-black/40">
              <div className="bg-dark-surface rounded-xl overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-bg/50 border-b border-white/4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1 mx-8">
                    <div
                      className="bg-dark-card/80 rounded-lg px-4 py-1.5 text-[11px] text-text-muted text-center font-mono"
                      dir="ltr"
                    >
                      mystore.aibuilder.app
                    </div>
                  </div>
                </div>
                {/* Builder Content */}
                <div className="flex min-h-[280px]">
                  {/* Sidebar mockup */}
                  <div className="w-52 border-l border-white/4 p-3 hidden md:block bg-dark-bg/20">
                    <div className="text-[10px] text-text-muted font-medium mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3 h-3" /> الأقسام
                    </div>
                    {["بطل الصفحة", "المنتجات", "التقييمات", "العروض"].map(
                      (s, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/2 mb-1.5 text-[11px] text-text-secondary border border-transparent hover:border-white/4 transition-colors"
                        >
                          <GripVertical className="w-3 h-3 text-text-muted/50" />
                          {s}
                        </div>
                      ),
                    )}
                    <div className="mt-4 text-[10px] text-text-muted font-medium mb-2.5 flex items-center gap-1.5">
                      <Bot className="w-3 h-3" /> AI محادثة
                    </div>
                    <div className="rounded-lg bg-primary/4 border border-primary/10 p-2.5 text-[10px] text-text-muted">
                      "غيّر الألوان لذهبي..."
                    </div>
                  </div>
                  {/* Preview mockup */}
                  <div className="flex-1 p-5 space-y-3">
                    <div className="h-28 rounded-xl bg-linear-to-br from-primary/15 to-accent/10 flex items-center justify-center relative overflow-hidden">
                      <div className="text-center relative z-10">
                        <p className="text-sm font-bold mb-1">متجر الأناقة</p>
                        <p className="text-[10px] text-text-muted">
                          أفخم المنتجات بين يديك
                        </p>
                        <div className="mt-2.5 bg-primary/20 rounded-lg px-4 py-1.5 text-[10px] inline-block text-primary-light">
                          تسوق الآن
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {[
                        { e: "👗", p: "899" },
                        { e: "👔", p: "459" },
                        { e: "👠", p: "1,299" },
                        { e: "👜", p: "2,499" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="bg-white/2 rounded-xl p-3 text-center border border-white/4"
                        >
                          <div className="text-xl mb-1.5">{item.e}</div>
                          <div className="h-1.5 w-3/4 bg-white/4 rounded mx-auto mb-1.5" />
                          <div className="text-[10px] font-bold text-primary-light">
                            {item.p} ر.س
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trusted By (Social proof) ── */}
      <section className="py-12 px-6 border-y border-white/3">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[12px] text-text-muted/60 uppercase tracking-[0.2em] font-medium mb-6">
            متوافق مع
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-30">
            {logos.map((l) => (
              <span
                key={l}
                className="text-text-muted text-sm font-bold tracking-wide"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (Linear-inspired cards) ── */}
      <section id="features" className="py-28 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[12px] text-primary-light/80 uppercase tracking-[0.2em] font-medium mb-4">
              المميزات
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
              كل أدوات البناء في مكان واحد
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              أدوات متكاملة لبناء متجر إلكتروني احترافي — بدون خبرة برمجية
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="group p-7 rounded-2xl border border-white/4 bg-white/1 hover:bg-white/2 hover:border-white/8 transition-all duration-300 relative overflow-hidden"
              >
                {f.badge && (
                  <span className="absolute top-5 left-5 text-[10px] text-accent bg-accent/8 border border-accent/15 px-2.5 py-1 rounded-lg font-medium">
                    {f.badge}
                  </span>
                )}
                <div
                  className={`w-11 h-11 rounded-xl bg-linear-to-br ${f.gradient} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105`}
                >
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold mb-2.5">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Template Showcase ── */}
      <section id="templates" className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/1.5 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-[12px] text-accent/80 uppercase tracking-[0.2em] font-medium mb-4">
              القوالب
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
              12 قالب احترافي لكل نوع متجر
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              كل قالب جاهز بالكامل — اضغط على أي قالب لمعاينته حيّاً
            </p>
          </motion.div>
          <TemplateShowcase />
        </div>
      </section>

      {/* ── How It Works (Clean steps) ── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[12px] text-success/80 uppercase tracking-[0.2em] font-medium mb-4">
              كيف يعمل
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
              ثلاث خطوات ومتجرك جاهز
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:bg-primary/8 group-hover:border-primary/15 group-hover:scale-105">
                  <s.icon className="w-6 h-6 text-text-muted group-hover:text-primary-light transition-colors" />
                </div>
                <span className="text-[11px] text-text-muted/50 font-bold tracking-[0.2em]">
                  {s.num}
                </span>
                <h3 className="text-lg font-bold my-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="reviews" className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-accent/1 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[12px] text-warning/80 uppercase tracking-[0.2em] font-medium mb-4">
              آراء العملاء
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
              عملاؤنا يحبوننا
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-5"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="p-7 rounded-2xl border border-white/4 bg-white/1 hover:bg-white/2 transition-all duration-300"
              >
                <div className="flex items-center gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-text-secondary text-[15px] leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary-light">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-[12px] text-text-muted">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing (Stripe-inspired) ── */}
      <section id="pricing" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[12px] text-primary-light/80 uppercase tracking-[0.2em] font-medium mb-4">
              الأسعار
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
              أسعار تناسب الجميع
            </h2>
            <p className="text-text-secondary text-lg">
              ابدأ مجاناً — ترقّ حين تحتاج
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5"
          >
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 border ${
                  plan.popular
                    ? "border-primary/25 bg-primary/3 shadow-lg shadow-primary/5"
                    : "border-white/4 bg-white/1"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-l from-transparent via-primary to-transparent" />
                )}
                <div className="p-7">
                  {plan.popular && (
                    <span className="text-[10px] text-primary-light bg-primary/10 border border-primary/15 px-3 py-1 rounded-lg font-medium inline-block mb-4">
                      الأكثر شعبية
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <plan.icon className="w-5 h-5 text-text-muted" />
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm text-text-muted">
                      {plan.period}
                    </span>
                  </div>
                  <div className="space-y-3.5 mb-8">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success/70 shrink-0" />
                        <span className="text-text-secondary">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/register"
                    className={`w-full text-center py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition-all duration-200 ${
                      plan.popular ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {plan.cta}
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center rounded-3xl border border-white/6 bg-linear-to-b from-primary/[0.04] to-transparent p-16 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/6 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-5 tracking-tight">
              جاهز تبني متجرك؟
            </h2>
            <p className="text-text-secondary text-lg mb-10 max-w-md mx-auto">
              ابدأ مجاناً — لا بطاقة ائتمان مطلوبة
            </p>
            <Link
              to="/register"
              className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2.5 rounded-2xl"
            >
              <Rocket className="w-5 h-5" />
              ابدأ الآن — مجاناً
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer (Clean minimal) ── */}
      <footer className="border-t border-white/4 py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text-static">
                  ويب فلو
                </span>
              </div>
              <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                منصة بناء المتاجر الإلكترونية بالذكاء الاصطناعي — 12 قالب، 21
                قسم، بناء تلقائي بالـ AI
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[13px] mb-4 text-text-primary">
                المنتج
              </h4>
              <div className="space-y-3 text-[13px] text-text-secondary">
                {[
                  { l: "المميزات", h: "#features" },
                  { l: "القوالب", h: "#templates" },
                  { l: "الأسعار", h: "#pricing" },
                ].map((link) => (
                  <a
                    key={link.l}
                    href={link.h}
                    className="block hover:text-text-primary transition-colors duration-200"
                  >
                    {link.l}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[13px] mb-4 text-text-primary">
                الشركة
              </h4>
              <div className="space-y-3 text-[13px] text-text-secondary">
                {[
                  { l: "من نحن", h: "/about" },
                  { l: "تواصل معنا", h: "/contact" },
                  { l: "سياسة الخصوصية", h: "/privacy" },
                ].map((link) => (
                  <Link
                    key={link.l}
                    to={link.h}
                    className="block hover:text-text-primary transition-colors duration-200"
                  >
                    {link.l}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/4 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-text-muted">
              &copy; {new Date().getFullYear()} منشئ ويب فلو. جميع الحقوق
              محفوظة.
            </p>
            <p className="text-[12px] text-text-muted">صُنع في السعودية</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
