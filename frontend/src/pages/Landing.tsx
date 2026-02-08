import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Zap, Shield, ArrowLeft, Palette,
  Layers, Bot, CheckCircle, Star, Eye, Code2,
  Rocket, Smartphone, Monitor,
  GripVertical, Wand2, MessageSquare, ChevronLeft, Package,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { STORE_TEMPLATES, getTemplateHTML, type StoreTemplate } from '../data/templates';

/* ════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════ */

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  cta: string;
  popular: boolean;
  gradient: string;
  icon: typeof Rocket;
  features: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'مجاني',
    price: '0',
    period: 'ر.س / شهرياً',
    cta: 'ابدأ مجاناً',
    popular: false,
    gradient: 'from-white/5 to-white/[0.02]',
    icon: Rocket,
    features: ['متجر واحد', '5 صفحات', 'قوالب أساسية', 'دعم المجتمع'],
  },
  {
    name: 'احترافي',
    price: '49',
    period: 'ر.س / شهرياً',
    cta: 'جرّب الآن',
    popular: true,
    gradient: 'from-primary/10 to-accent/10',
    icon: Sparkles,
    features: ['5 متاجر', 'صفحات غير محدودة', 'كل القوالب', 'ذكاء اصطناعي متقدم', 'نطاق مخصص', 'أولوية الدعم'],
  },
  {
    name: 'أعمال',
    price: '149',
    period: 'ر.س / شهرياً',
    cta: 'تواصل معنا',
    popular: false,
    gradient: 'from-white/5 to-white/[0.02]',
    icon: Shield,
    features: ['متاجر غير محدودة', 'كل المميزات', 'API كامل', 'دعم مخصص 24/7', 'تدريب الفريق'],
  },
];

const features = [
  { icon: Bot, title: 'بناء بالذكاء الاصطناعي', desc: 'اوصف متجرك والذكاء الاصطناعي يبني لك تصميم كامل — يفهم العربي 100%', gradient: 'from-violet-500 to-purple-600', badge: 'الأقوى' },
  { icon: Layers, title: '21+ قسم سحب وإفلات', desc: 'أقسام جاهزة: بطل، منتجات، تقييمات، عروض، عداد، FAQ وأكثر', gradient: 'from-cyan-500 to-blue-600' },
  { icon: Palette, title: '12 قالب احترافي', desc: 'أزياء فاخرة، إلكترونيات، جواهر، عطور، رياضة — لكل نوع قالب جاهز', gradient: 'from-amber-500 to-orange-600' },
  { icon: Code2, title: 'تصدير HTML كامل', desc: 'حمّل تصميم متجرك كملف HTML جاهز — ملكك تنشره وين ما تبي', gradient: 'from-emerald-500 to-green-600' },
  { icon: Shield, title: 'متجاوب 100%', desc: 'يشتغل بكمال على الجوال، التابلت، والكمبيوتر — مع RTL ودعم عربي', gradient: 'from-blue-500 to-indigo-600' },
  { icon: Zap, title: 'سرعة خارقة', desc: 'كود نظيف وخفيف — متجرك يحمّل في أقل من ثانية', gradient: 'from-rose-500 to-pink-600' },
];

const testimonials = [
  { name: 'سارة المالكي', role: 'صاحبة متجر أزياء', text: 'كتبت "أبي متجر أزياء فاخر" وطلع لي تصميم أحلى من اللي يسويه المصممين! مستحيل أرجع للطريقة القديمة.', stars: 5, gradient: 'from-pink-500/20 to-purple-500/20' },
  { name: 'محمد العتيبي', role: 'متجر إلكترونيات', text: 'القوالب الجاهزة خرافية — اخترت قالب وعدلت بالذكاء الاصطناعي وخلّص كل شي في 5 دقائق.', stars: 5, gradient: 'from-cyan-500/20 to-blue-500/20' },
  { name: 'نورة القحطاني', role: 'متجر مستحضرات', text: 'أفضل منصة جربتها — السحب والإفلات سهل جداً والنتيجة احترافية فعلاً. أنصح فيها بقوة.', stars: 5, gradient: 'from-amber-500/20 to-orange-500/20' },
  { name: 'خالد الدوسري', role: 'متجر عطور', text: 'ميزة البناء بالذكاء الاصطناعي غيرت كل شي — أقول له أضف قسم عروض ويضيفه يبيله ثواني بس.', stars: 5, gradient: 'from-green-500/20 to-emerald-500/20' },
];

const steps = [
  { num: '01', title: 'سمّ متجرك', desc: 'اكتب اسم متجرك واختر نوعه من 12 تخصص', icon: MessageSquare, color: 'primary' },
  { num: '02', title: 'اختر أو ابنِ', desc: 'اختر قالب جاهز أو خلّ الذكاء الاصطناعي يبني لك', icon: Wand2, color: 'accent' },
  { num: '03', title: 'خصّص وانشر', desc: 'عدّل بالسحب والإفلات أو بالشات ثم انشر بضغطة', icon: Rocket, color: 'success' },
];

const stats = [
  { value: '12', label: 'قالب احترافي', icon: Palette },
  { value: '21+', label: 'قسم جاهز', icon: Layers },
  { value: '12', label: 'نوع متجر', icon: Package },
  { value: '∞', label: 'تخصيص AI', icon: Bot },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/* ════════════════════════════════════════════
   COMPONENT: Live Template Carousel
   ════════════════════════════════════════════ */
function TemplateShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTemplate, setActiveTemplate] = useState<StoreTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
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
      {/* Carousel */}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1">
        {showcaseTemplates.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="shrink-0 w-[260px] glass-card-glow overflow-hidden cursor-pointer group"
            onClick={() => setActiveTemplate(t)}
          >
            <div className="h-36 relative" style={{ background: t.thumbnail }}>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
                <span className="badge badge-primary text-xs flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  معاينة حية
                </span>
              </div>
              <div className="absolute bottom-3 right-3 left-3">
                <p className="font-bold text-white text-sm">{t.name}</p>
                <p className="text-[11px] text-white/60">{t.description.slice(0, 40)}...</p>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full border border-dark-border" style={{ background: t.primaryColor }} />
                <div className="w-3.5 h-3.5 rounded-full border border-dark-border" style={{ background: t.accentColor }} />
              </div>
              <span className="badge badge-neutral text-[10px]">{t.sections.length} قسم</span>
            </div>
          </motion.div>
        ))}
        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="shrink-0 w-[260px] glass-card border-dashed border-primary/20 flex items-center justify-center p-6"
        >
          <Link to="/register" className="text-center group">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-7 h-7 text-primary-light" />
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
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setActiveTemplate(null)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-surface rounded-2xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col border border-dark-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: activeTemplate.thumbnail }} />
                <div>
                  <h3 className="font-bold text-sm">{activeTemplate.name}</h3>
                  <p className="text-[11px] text-text-muted">{activeTemplate.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-dark-bg rounded-lg p-0.5 border border-dark-border">
                  <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-md transition ${previewDevice === 'desktop' ? 'bg-primary text-white' : 'text-text-muted'}`}>
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-md transition ${previewDevice === 'mobile' ? 'bg-primary text-white' : 'text-text-muted'}`}>
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Link to="/register" className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                  ابنِ بهذا القالب
                  <ChevronLeft className="w-3 h-3" />
                </Link>
                <button onClick={() => setActiveTemplate(null)} className="p-2 rounded-lg hover:bg-dark-hover text-text-muted transition-colors text-lg">×</button>
              </div>
            </div>
            {/* Preview */}
            <div className="flex-1 overflow-hidden bg-neutral-200 flex items-start justify-center p-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl h-full transition-all duration-300" style={{ width: previewDevice === 'mobile' ? '375px' : '100%' }}>
                <iframe ref={iframeRef} className="w-full h-full border-0" sandbox="allow-scripts" title="Preview" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════
  MAIN LANDING PAGE
  ════════════════════════════════════════════ */

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-bg">

      {/* ══════ Header ══════ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-dark-bg/70 backdrop-blur-2xl border-b border-dark-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/15">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AI بلدر</span>
            <span className="badge badge-primary text-[9px]">Pro</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">المميزات</a>
            <a href="#templates" className="hover:text-text-primary transition-colors">القوالب</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">الأسعار</a>
            <a href="#reviews" className="hover:text-text-primary transition-colors">آراء العملاء</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm px-4 py-2">تسجيل الدخول</Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2.5">ابدأ مجاناً</Link>
          </div>
        </div>
      </header>

      {/* ══════ Hero Section (Webiny + Plasmic inspired) ══════ */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/6 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute top-60 right-[20%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Orbiting dots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none opacity-30">
          <div className="absolute w-2 h-2 rounded-full bg-primary animate-orbit" style={{ animationDuration: '25s' }} />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-accent animate-orbit" style={{ animationDuration: '35s', animationDelay: '-10s' }} />
          <div className="absolute w-1 h-1 rounded-full bg-warning animate-orbit" style={{ animationDuration: '20s', animationDelay: '-5s' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary-light text-sm mb-8 backdrop-blur-sm">
              <div className="dot-live" />
              <span>منصة بناء المتاجر الإلكترونية بالذكاء الاصطناعي</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.15] mb-6 tracking-tight">
              ابنِ متجرك الإلكتروني
              <br />
              <span className="gradient-text">بقوة الذكاء الاصطناعي</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              اختر من 12 قالب احترافي، اسحب وأفلت أقسام جاهزة، أو خلّ الذكاء الاصطناعي يبني لك متجر كامل —{' '}
              <span className="text-text-primary font-semibold">كل شي بالعربي</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 shadow-xl shadow-primary/20">
                <Rocket className="w-5 h-5" />
                ابدأ بناء متجرك — مجاناً
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <a href="#templates" className="btn-outline text-lg px-8 py-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                شوف القوالب
              </a>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-primary-light" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-text-primary block leading-tight">{s.value}</span>
                    <span className="text-[11px] text-text-muted">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Hero Visual: Builder Mockup (Webiny-inspired) ── */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 max-w-4xl mx-auto">
            <div className="glass-card-glow p-1.5 rounded-2xl">
              <div className="bg-dark-surface rounded-xl overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-bg/60 border-b border-dark-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-danger/50" />
                    <div className="w-3 h-3 rounded-full bg-warning/50" />
                    <div className="w-3 h-3 rounded-full bg-success/50" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-dark-card rounded-lg px-4 py-1.5 text-xs text-text-muted text-center font-mono" dir="ltr">mystore.aibuilder.app</div>
                  </div>
                </div>
                {/* Builder Content */}
                <div className="flex">
                  {/* Sidebar mockup */}
                  <div className="w-56 border-l border-dark-border/50 p-3 hidden md:block bg-dark-bg/30">
                    <div className="text-[10px] text-text-muted font-semibold mb-2 flex items-center gap-1"><Layers className="w-3 h-3" /> الأقسام</div>
                    {['بطل الصفحة', 'المنتجات', 'التقييمات', 'العروض'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-dark-card/50 mb-1.5 text-xs text-text-secondary cursor-default">
                        <GripVertical className="w-3 h-3 text-text-muted" />
                        {s}
                      </div>
                    ))}
                    <div className="mt-3 text-[10px] text-text-muted font-semibold mb-2 flex items-center gap-1"><Bot className="w-3 h-3" /> AI محادثة</div>
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-2 text-[10px] text-text-muted">
                      "غيّر الألوان لذهبي..."
                    </div>
                  </div>
                  {/* Preview mockup */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="h-28 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid opacity-20" />
                      <div className="text-center relative z-10">
                        <p className="text-sm font-bold mb-1">متجر الأناقة</p>
                        <p className="text-[10px] text-text-muted">أفخم المنتجات بين يديك</p>
                        <div className="mt-2 bg-primary/30 rounded-lg px-4 py-1 text-[10px] inline-block">تسوق الآن</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { e: '👗', p: '899' },
                        { e: '👔', p: '459' },
                        { e: '👠', p: '1,299' },
                        { e: '👜', p: '2,499' },
                      ].map((item, i) => (
                        <div key={i} className="bg-dark-card/50 rounded-xl p-2.5 text-center border border-dark-border/30">
                          <div className="text-xl mb-1">{item.e}</div>
                          <div className="h-1.5 w-3/4 bg-dark-hover rounded mx-auto mb-1" />
                          <div className="text-[10px] font-bold text-primary-light">{item.p} ر.س</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="h-3 w-24 bg-dark-card/50 rounded" />
                      <div className="h-3 w-16 bg-primary/15 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ Features (Webiny card style) ══════ */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="badge badge-primary mb-4">المميزات</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">كل أدوات البناء <span className="gradient-text">في مكان واحد</span></h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">أدوات متكاملة لبناء متجر إلكتروني احترافي — بدون خبرة برمجية</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass-card-glow p-6 group relative overflow-hidden">
                {f.badge && (
                  <span className="absolute top-4 left-4 badge badge-accent text-[10px]">{f.badge}</span>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ Template Showcase (Plasmic-inspired live preview) ══════ */}
      <section id="templates" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-primary/2 to-dark-bg" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="badge badge-accent mb-4">القوالب</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">12 قالب احترافي <span className="gradient-text">لكل نوع متجر</span></h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">كل قالب جاهز بالكامل — اضغط على أي قالب لمعاينته حيّاً</p>
          </motion.div>

          <TemplateShowcase />
        </div>
      </section>

      {/* ══════ How It Works (Frappe-inspired clean steps) ══════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="badge badge-success mb-4">كيف يعمل</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">ثلاث خطوات <span className="gradient-text">ومتجرك جاهز</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center relative group">
                {/* Connector line */}
                {i < 2 && <div className="hidden md:block absolute top-12 left-0 w-full border-t border-dashed border-dark-border" />}
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 relative z-10 transition-all group-hover:scale-110 group-hover:bg-primary/15">
                  <s.icon className="w-7 h-7 text-primary-light" />
                </div>
                <span className="text-[10px] text-text-muted font-bold tracking-widest">{s.num}</span>
                <h3 className="text-lg font-bold my-2">{s.title}</h3>
                <p className="text-text-secondary text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Testimonials ══════ */}
      <section id="reviews" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-accent/2 to-dark-bg" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="badge badge-warning mb-4">آراء العملاء</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">عملاؤنا <span className="gradient-text">يحبوننا</span></h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass-card-glow p-6 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-30`} />
                <div className="relative z-10">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-[11px] text-text-muted">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ Pricing ══════ */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="badge badge-primary mb-4">الأسعار</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">أسعار <span className="gradient-text">تناسب الجميع</span></h2>
            <p className="text-text-secondary text-lg">ابدأ مجاناً — ترقّ حين تحتاج</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5">
            {pricingPlans.map((plan, i) => (
              <motion.div key={i} variants={fadeUp}
                className={`relative rounded-2xl overflow-hidden transition-all hover:-translate-y-1 ${
                  plan.popular ? 'glass-card-glow border-primary/30' : 'glass-card'
                }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-primary to-accent" />
                )}
                <div className={`p-6 bg-gradient-to-br ${plan.gradient}`}>
                  {plan.popular && (
                    <span className="badge badge-primary text-[10px] mb-3">الأكثر شعبية</span>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <plan.icon className="w-5 h-5 text-primary-light" />
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-text-muted">{plan.period}</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      <span className="text-text-secondary">{f}</span>
                    </div>
                  ))}
                  <Link to="/register"
                    className={`w-full text-center py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-4 ${
                      plan.popular ? 'btn-primary' : 'btn-outline'
                    }`}>
                    {plan.cta}
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ Final CTA ══════ */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card-glow p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/15">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">جاهز تبني متجرك؟</h2>
            <p className="text-text-secondary text-lg mb-8 max-w-lg mx-auto">ابدأ مجاناً — لا بطاقة ائتمان مطلوبة</p>
            <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 shadow-xl shadow-primary/20">
              <Rocket className="w-5 h-5" />
              ابدأ الآن — مجاناً
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ══════ Footer ══════ */}
      <footer className="border-t border-dark-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">AI بلدر</span>
              </div>
              <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-4">
                منصة بناء المتاجر الإلكترونية بالذكاء الاصطناعي — 12 قالب، 21 قسم، بناء تلقائي بالـ AI
              </p>
              <div className="flex items-center gap-3">
                {['𝕏', '📸', '💬'].map((icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-text-muted hover:text-primary-light hover:border-primary/30 transition-all text-sm">{icon}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">المنتج</h4>
              <div className="space-y-2 text-sm text-text-secondary">
                {[{ l: 'المميزات', h: '#features' }, { l: 'القوالب', h: '#templates' }, { l: 'الأسعار', h: '#pricing' }].map(link => (
                  <a key={link.l} href={link.h} className="block hover:text-text-primary transition-colors">{link.l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">الشركة</h4>
              <div className="space-y-2 text-sm text-text-secondary">
                {['من نحن', 'تواصل معنا', 'سياسة الخصوصية', 'الشروط والأحكام'].map(l => (
                  <a key={l} href="#" className="block hover:text-text-primary transition-colors">{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-dark-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">© {new Date().getFullYear()} AI Store Builder Pro. جميع الحقوق محفوظة.</p>
            <p className="text-xs text-text-muted flex items-center gap-1">صُنع بـ <span className="text-danger">❤</span> في السعودية 🇸🇦</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
