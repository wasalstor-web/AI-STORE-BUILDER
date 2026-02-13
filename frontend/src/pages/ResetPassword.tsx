import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  KeyRound,
  Check,
  X as XIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import AppBackdrop from "../components/graphics/AppBackdrop";
import { authApi } from "../lib/api";
import { useMemo } from "react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "إعادة تعيين كلمة المرور | ويب فلو";
  }, []);

  const passwordStrength = useMemo(() => {
    const checks = {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("الرمز يجب أن يكون 6 أرقام");
      return;
    }
    if (passwordStrength.score < 3) {
      toast.error("كلمة المرور ضعيفة");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email,
        code,
        new_password: password,
      });
      toast.success(res.data.message);
      navigate("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "فشل إعادة التعيين";
      toast.error(msg);
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
          <h1 className="text-2xl font-bold">إعادة تعيين كلمة المرور</h1>
          <p className="text-white/50 mt-2">أدخل الرمز وكلمة المرور الجديدة</p>
        </div>

        <div className="glass-card-glow p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-violet-400" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!emailParam && (
              <div>
                <label
                  htmlFor="reset-email"
                  className="text-sm text-text-secondary mb-2 block"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    id="reset-email"
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
                htmlFor="reset-code"
                className="text-sm text-text-secondary mb-2 block"
              >
                رمز إعادة التعيين
              </label>
              <input
                id="reset-code"
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

            <div>
              <label
                htmlFor="reset-password"
                className="text-sm text-text-secondary mb-2 block"
              >
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pr-12 pl-12"
                  dir="ltr"
                  style={{ textAlign: "left" }}
                  aria-describedby="reset-password-strength"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* Password Strength */}
              {password && (
                <div
                  id="reset-password-strength"
                  className="mt-3 space-y-2"
                  aria-live="polite"
                >
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= i
                            ? passwordStrength.score >= 3
                              ? "bg-emerald-500"
                              : passwordStrength.score >= 2
                                ? "bg-amber-500"
                                : "bg-red-500"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1 text-xs">
                    {Object.entries({
                      minLength: "8 أحرف على الأقل",
                      hasNumber: "رقم واحد على الأقل",
                      hasLetter: "حرف واحد على الأقل",
                    }).map(([key, label]) => (
                      <div
                        key={key}
                        className={`flex items-center gap-1.5 ${
                          passwordStrength.checks[
                            key as keyof typeof passwordStrength.checks
                          ]
                            ? "text-emerald-400"
                            : "text-white/30"
                        }`}
                      >
                        {passwordStrength.checks[
                          key as keyof typeof passwordStrength.checks
                        ] ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <XIcon className="w-3 h-3" />
                        )}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6 || passwordStrength.score < 3}
              className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  تغيير كلمة المرور
                </>
              )}
            </button>
          </form>
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
