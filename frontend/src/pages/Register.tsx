import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
  Check,
  X as XIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import AppBackdrop from "../components/graphics/AppBackdrop";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    tenantName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "إنشاء حساب | ويب فلو";
  }, []);

  const update = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strengthScore < 3) {
      toast.error("كلمة المرور يجب أن تحقق جميع المتطلبات");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.fullName, form.tenantName);
      toast.success("تم إنشاء حسابك! تحقق من بريدك الإلكتروني 📧");
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "فشل إنشاء الحساب";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "fullName",
      label: "الاسم الكامل",
      icon: User,
      type: "text",
      placeholder: "أحمد محمد",
      dir: "rtl",
    },
    {
      key: "tenantName",
      label: "اسم الشركة / المتجر",
      icon: Building2,
      type: "text",
      placeholder: "شركة النجاح",
      dir: "rtl",
    },
    {
      key: "email",
      label: "البريد الإلكتروني",
      icon: Mail,
      type: "email",
      placeholder: "example@email.com",
      dir: "ltr",
    },
  ];

  // ══ Password Strength ══
  const passwordChecks = useMemo(() => {
    const pw = form.password;
    return [
      { label: "8 أحرف على الأقل", met: pw.length >= 8 },
      { label: "حرف واحد على الأقل", met: /[a-zA-Zأ-ي]/.test(pw) },
      { label: "رقم واحد على الأقل", met: /\d/.test(pw) },
    ];
  }, [form.password]);

  const strengthScore = passwordChecks.filter((c) => c.met).length;
  const strengthColor =
    strengthScore === 3
      ? "bg-emerald-500"
      : strengthScore === 2
        ? "bg-amber-500"
        : strengthScore >= 1
          ? "bg-red-500"
          : "bg-white/10";
  const strengthLabel =
    strengthScore === 3
      ? "قوية"
      : strengthScore === 2
        ? "متوسطة"
        : strengthScore >= 1
          ? "ضعيفة"
          : "";

  return (
    <div className="app-shell min-h-screen flex items-center justify-center px-4 py-12 bg-[#08090d]">
      <AppBackdrop variant="auth" intensity="max" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-content w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-xl shadow-violet-600/15">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
          <p className="text-white/50 mt-2">ابدأ بناء متجرك في دقائق</p>
        </div>

        <div className="glass-card-glow p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((f) => (
              <div key={f.key}>
                <label
                  htmlFor={`reg-${f.key}`}
                  className="text-sm text-text-secondary mb-2 block"
                >
                  {f.label}
                </label>
                <div className="relative">
                  <f.icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    id={`reg-${f.key}`}
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    required
                    className="input-field pr-12"
                    dir={f.dir}
                    style={f.dir === "ltr" ? { textAlign: "left" } : {}}
                  />
                </div>
              </div>
            ))}

            <div>
              <label
                htmlFor="reg-password"
                className="text-sm text-text-secondary mb-2 block"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="8 أحرف على الأقل"
                  required
                  minLength={8}
                  className="input-field pr-12 pl-12"
                  dir="ltr"
                  style={{ textAlign: "left" }}
                  aria-describedby="password-strength"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password.length > 0 && (
                <div
                  className="mt-2.5 space-y-2"
                  id="password-strength"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            i < strengthScore ? strengthColor : "bg-white/6"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        strengthScore === 3
                          ? "text-emerald-400"
                          : strengthScore === 2
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {passwordChecks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-1.5 text-[11px]"
                      >
                        {check.met ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XIcon className="w-3 h-3 text-white/20" />
                        )}
                        <span
                          className={
                            check.met ? "text-white/60" : "text-white/30"
                          }
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || strengthScore < 3}
              className="btn-primary w-full py-3 text-center flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  إنشاء الحساب
                </>
              )}
            </button>

            <p className="text-[11px] text-white/25 text-center mt-3">
              بإنشاء حسابك، أنت توافق على{" "}
              <Link
                to="/privacy"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                شروط الاستخدام وسياسة الخصوصية
              </Link>
            </p>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            عندك حساب؟{" "}
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-semibold"
            >
              سجّل دخول
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
