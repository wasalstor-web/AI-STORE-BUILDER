import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Shield,
  Zap,
  Globe,
  Users,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";

const stats = [
  { value: "16+", label: "نوع مشروع" },
  { value: "12", label: "قالب احترافي" },
  { value: "AI", label: "ذكاء اصطناعي" },
  { value: "24/7", label: "دعم مستمر" },
];

const values = [
  {
    icon: Bot,
    title: "الابتكار بالذكاء الاصطناعي",
    desc: "نستخدم أحدث تقنيات الذكاء الاصطناعي لتمكين أي شخص من بناء موقع احترافي بمحادثة بسيطة.",
  },
  {
    icon: Shield,
    title: "الأمان والخصوصية",
    desc: "نحمي بياناتك بأعلى معايير التشفير والأمان. خصوصيتك أولوية قصوى لدينا.",
  },
  {
    icon: Zap,
    title: "السرعة والأداء",
    desc: "مواقع سريعة ومحسّنة للأداء تعمل على جميع الأجهزة بدون تأخير.",
  },
  {
    icon: Globe,
    title: "عربي أولاً",
    desc: "منصة مصممة للسوق العربي — دعم كامل للغة العربية واتجاه RTL من البداية.",
  },
];

export default function About() {
  useEffect(() => { document.title = "من نحن | ويب فلو" }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* Header */}
      <header className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text-static">
              ويب فلو
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
          >
            <ArrowRight className="w-4 h-4" /> الرئيسية
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5">من نحن</h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            ويب فلو هي منصة سعودية لبناء المواقع والمتاجر الإلكترونية بالذكاء
            الاصطناعي. نُمكّن رواد الأعمال من إطلاق مشاريعهم الرقمية بدقائق —
            بدون خبرة تقنية.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-card p-6 text-center hover:border-primary/20 transition-all"
            >
              <p className="text-3xl font-bold gradient-text-static mb-2">
                {s.value}
              </p>
              <p className="text-sm text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-bold text-center mb-10">قيمنا</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {values.map((v) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 flex gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <v.icon className="w-6 h-6 text-primary-light" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">جاهز لبناء موقعك؟</h2>
        <p className="text-text-secondary mb-8">
          ابدأ مجاناً — بدون بطاقة ائتمان
        </p>
        <Link
          to="/register"
          className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3"
        >
          ابدأ الآن <Sparkles className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 px-6 text-center">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} منشئ ويب فلو. جميع الحقوق محفوظة.
        </p>
      </footer>
    </div>
  );
}
