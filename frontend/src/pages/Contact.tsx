import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Mail,
  MessageSquare,
  MapPin,
  Send,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const contactMethods = [
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    value: "support@webflow.sa",
    desc: "نرد خلال 24 ساعة",
  },
  {
    icon: MessageSquare,
    title: "الدردشة المباشرة",
    value: "متاحة من 9 ص - 11 م",
    desc: "دعم فوري بالعربي",
  },
  {
    icon: MapPin,
    title: "الموقع",
    value: "المملكة العربية السعودية",
    desc: "فريق عمل سعودي",
  },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("جميع الحقول مطلوبة");
      return;
    }
    setSending(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("تم إرسال رسالتك بنجاح! سنرد عليك قريباً");
    setName("");
    setEmail("");
    setMessage("");
    setSending(false);
  };

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

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-4xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            نحن هنا لمساعدتك. أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {contactMethods.map((m) => (
            <div
              key={m.title}
              className="glass-card p-5 text-center hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <m.icon className="w-5 h-5 text-primary-light" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{m.title}</h3>
              <p className="text-primary-light text-sm">{m.value}</p>
              <p className="text-text-muted text-xs mt-1">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-8 max-w-2xl mx-auto"
        >
          <h2 className="text-xl font-bold mb-6">أرسل رسالة</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                  الاسم *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="اسمك الكريم"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                الرسالة *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field min-h-[140px] resize-none"
                placeholder="كيف يمكننا مساعدتك؟"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? "جاري الإرسال..." : "إرسال الرسالة"}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 px-6 text-center">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} منشئ ويب فلو. جميع الحقوق محفوظة.
        </p>
      </footer>
    </div>
  );
}
