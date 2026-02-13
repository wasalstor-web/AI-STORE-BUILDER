import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import AppBackdrop from "../components/graphics/AppBackdrop";
import { authApi } from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    document.title = "تأكيد البريد الإلكتروني | ويب فلو";
  }, []);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("الرمز يجب أن يكون 6 أرقام");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email, code });
      toast.success(res.data.message);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "فشل التحقق";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("أدخل البريد الإلكتروني");
      return;
    }
    setResending(true);
    try {
      const res = await authApi.resendVerification({ email });
      toast.success(res.data.message);
      setCooldown(60);
    } catch {
      toast.error("فشل إعادة إرسال الرمز");
    } finally {
      setResending(false);
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
          <h1 className="text-2xl font-bold">تأكيد البريد الإلكتروني</h1>
          <p className="text-white/50 mt-2">
            أدخل الرمز المكون من 6 أرقام المُرسل إلى بريدك
          </p>
        </div>

        {/* Form */}
        <div className="glass-card-glow p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-violet-400" />
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            {!emailParam && (
              <div>
                <label
                  htmlFor="verify-email"
                  className="text-sm text-text-secondary mb-2 block"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    id="verify-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="input-field pr-12"
                    dir="ltr"
                    style={{ textAlign: "left" }}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="verify-code"
                className="text-sm text-text-secondary mb-2 block"
              >
                رمز التحقق
              </label>
              <input
                id="verify-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                required
                className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                dir="ltr"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  تأكيد البريد
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
            >
              {resending
                ? "جاري الإرسال..."
                : cooldown > 0
                  ? `إعادة إرسال الرمز (${cooldown}ث)`
                  : "لم يصلك الرمز؟ إعادة إرسال"}
            </button>
          </div>
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
