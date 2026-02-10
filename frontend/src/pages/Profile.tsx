import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { authApi, tenantsApi } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Tenant } from "../types";
import {
  User,
  Shield,
  Building2,
  Save,
  Loader2,
  Key,
  Mail,
  Crown,
  Calendar,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ["tenant"],
    queryFn: async () => (await tenantsApi.current()).data,
  });

  useEffect(() => {
    document.title = "الملف الشخصي | ويب فلو";
  }, []);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return toast.error("الاسم مطلوب");
    setSavingProfile(true);
    try {
      await authApi.updateProfile({ full_name: fullName.trim() });
      toast.success("تم تحديث الملف الشخصي");
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {
      toast.error("فشل التحديث");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) return toast.error("أدخل كلمة المرور الحالية");
    if (!newPassword || newPassword.length < 8)
      return toast.error("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
    if (newPassword !== confirmPassword)
      return toast.error("كلمة المرور الجديدة غير متطابقة");

    setSavingPassword(true);
    try {
      await authApi.updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("تم تغيير كلمة المرور");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "فشل التغيير";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-1">الملف الشخصي</h1>
        <p className="text-text-muted text-sm">إدارة حسابك وإعداداتك الشخصية</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card overflow-hidden"
      >
        <div className="bg-linear-to-br from-violet-600/10 to-blue-600/10 p-6 border-b border-white/6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.full_name}</h2>
              <p className="text-sm text-text-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                  <CheckCircle className="w-3 h-3" />
                  نشط
                </span>
                <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Crown className="w-3 h-3" />
                  {user?.role === "admin" ? "مدير" : "مستخدم"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> الاسم الكامل
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="الاسم الكامل"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> البريد الإلكتروني
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="input-field opacity-60 cursor-not-allowed"
            />
            <p className="text-[11px] text-text-muted mt-1">
              لا يمكن تغيير البريد الإلكتروني حالياً
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile || fullName === user?.full_name}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {savingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profileSaved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {profileSaved ? "تم الحفظ!" : "حفظ التغييرات"}
          </button>
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-primary-light" /> تغيير كلمة المرور
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="8 أحرف على الأقل"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="أعد إدخال كلمة المرور"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={savingPassword || !currentPassword || !newPassword}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {savingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            تغيير كلمة المرور
          </button>
        </div>
      </motion.div>

      {/* Tenant Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary-light" /> معلومات الحساب
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
            <p className="text-xs text-text-muted mb-1">اسم المؤسسة</p>
            <p className="font-medium">{tenant?.name || "—"}</p>
          </div>
          <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
            <p className="text-xs text-text-muted mb-1">الخطة</p>
            <p className="font-medium flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-violet-400" />
              {tenant?.plan === "free" ? "مجانية" : "احترافية"}
            </p>
          </div>
          <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
            <p className="text-xs text-text-muted mb-1">معرّف الحساب</p>
            <p className="font-mono text-xs text-text-secondary" dir="ltr">
              {tenant?.id?.slice(0, 8)}...
            </p>
          </div>
          <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
            <p className="text-xs text-text-muted mb-1">تاريخ الإنشاء</p>
            <p className="text-sm flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              {tenant?.created_at
                ? new Date(tenant.created_at).toLocaleDateString("ar-SA")
                : "—"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
