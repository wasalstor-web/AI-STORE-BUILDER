import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Building2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    tenantName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.fullName, form.tenantName);
      toast.success('تم إنشاء حسابك بنجاح! 🎉');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'فشل إنشاء الحساب';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'fullName', label: 'الاسم الكامل', icon: User, type: 'text', placeholder: 'أحمد محمد', dir: 'rtl' },
    { key: 'tenantName', label: 'اسم الشركة / المتجر', icon: Building2, type: 'text', placeholder: 'شركة النجاح', dir: 'rtl' },
    { key: 'email', label: 'البريد الإلكتروني', icon: Mail, type: 'email', placeholder: 'example@email.com', dir: 'ltr' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/15">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
          <p className="text-text-secondary mt-2">ابدأ بناء متجرك في دقائق</p>
        </div>

        <div className="glass-card-glow p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-sm text-text-secondary mb-2 block">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    required
                    className="input-field pr-12"
                    dir={f.dir}
                    style={f.dir === 'ltr' ? { textAlign: 'left' } : {}}
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-sm text-text-secondary mb-2 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="8 أحرف على الأقل"
                  required
                  minLength={8}
                  className="input-field pr-12 pl-12"
                  dir="ltr"
                  style={{ textAlign: 'left' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-center flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  إنشاء الحساب
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            عندك حساب؟{' '}
            <Link to="/login" className="text-primary-light hover:text-primary font-semibold">
              سجّل دخول
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
