import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Loader2, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import AppBackdrop from "../components/graphics/AppBackdrop";
import { authApi } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "نسيت كلمة المرور | ويب فلو";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      toast.success(res.data.message);
      setSent(true);
    } catch {
      toast.error("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex items-center justify-center px-4 bg-[#08090d]">
      <AppBackdrop variant="auth" intensity="max" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-content w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-xl shadow-violet-600/15">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">نسيت كلمة المرور</h1>
          <p className="text-white/50 mt-2">
            {sent
              ? "تم إرسال رمز إعادة التعيين إلى بريدك"
              : "أدخل بريدك وسنرسل لك رمز إعادة التعيين"}
          </p>
        </div>

        <div className="glass-card-glow p-8">
          {sent ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center">
                  <Send className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <p className="text-white/70">
                إذا كان بريدك{" "}
                <span className="text-white font-mono" dir="ltr">
                  {email}
                </span>{" "}
                مسجلاً، سيصلك رمز مكون من 6 أرقام.
              </p>
              <Link
                to={`/reset-password?email=${encodeURIComponent(email)}`}
                className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                إدخال رمز إعادة التعيين ←
              </Link>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                إعادة إرسال لبريد آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="text-sm text-text-secondary mb-2 block"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="input-field pr-12"
                    dir="ltr"
                    style={{ textAlign: "left" }}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    إرسال رمز إعادة التعيين
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة لتسجيل الدخول
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
