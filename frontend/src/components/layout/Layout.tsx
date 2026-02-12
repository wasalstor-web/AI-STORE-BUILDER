import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Zap,
  Bot,
  Palette,
  Crown,
  UserCog,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { tenantsApi } from "../../lib/api";
import AppBackdrop from "../graphics/AppBackdrop";

const navItems = [
  { path: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { path: "/stores/create", label: "إنشاء متجر", icon: PlusCircle },
  { path: "/stores/ai-builder", label: "بناء بالـ AI", icon: Bot },
];

const secondaryItems = [
  { path: "/stores/create", label: "معرض القوالب", icon: Palette },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isBuilder = location.pathname.startsWith("/stores/ai-builder");

  // Fetch tenant plan dynamically (cached via React Query)
  const { data: tenantData } = useQuery({
    queryKey: ["tenant"],
    queryFn: async () => (await tenantsApi.current()).data,
    staleTime: 5 * 60 * 1000,
  });
  const tenantPlan = tenantData?.plan || "free";

  const planLabels: Record<string, string> = {
    free: "الخطة المجانية",
    pro: "الخطة الاحترافية",
    business: "خطة الأعمال",
  };
  const planInfo: Record<string, string> = {
    free: "3 متاجر • AI أساسي",
    pro: "10 متاجر • AI متقدم",
    business: "غير محدود • AI كامل",
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <AppBackdrop
        variant={isBuilder ? "builder" : "app"}
        intensity={isBuilder ? "lux" : "max"}
      />
      <div className="app-content flex min-h-screen">
        {/* ══ Sidebar (Desktop) ══ */}
        <aside className="hidden lg:flex flex-col w-60 bg-[#0e1015]/90 backdrop-blur-xl border-l border-white/6">
          {/* Logo */}
          <div className="px-5 py-4 border-b border-white/6">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                ويب فلو
              </span>
              <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-[8px] font-bold text-violet-400 tracking-wider">
                PRO
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <p className="text-[10px] text-white/25 font-medium px-3 mb-2 tracking-wider">
              القائمة
            </p>
            {navItems.map((item) => {
              const active =
                location.pathname === item.path ||
                (item.path !== "/dashboard" &&
                  location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-[13px] ${
                    active
                      ? "bg-violet-500/15 text-violet-400 border border-violet-500/20"
                      : "text-white/50 hover:bg-white/4 hover:text-white/80 border border-transparent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4 pb-1">
              <p className="text-[10px] text-white/25 font-medium px-3 mb-2 tracking-wider">
                أدوات
              </p>
            </div>
            {secondaryItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-[13px] text-white/50 hover:bg-white/4 hover:text-white/80"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Plan badge */}
          <div className="px-3 pb-2">
            <div className="p-3 rounded-lg bg-linear-to-br from-violet-500/8 to-blue-500/8 border border-violet-500/10">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[11px] font-semibold text-white/70">
                  {planLabels[tenantPlan] || planLabels.free}
                </span>
                {tenantPlan === "free" && (
                  <span className="px-1 py-px rounded bg-violet-500/20 text-[8px] font-bold text-violet-400 mr-auto">
                    ترقية
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/30">
                {planInfo[tenantPlan] || planInfo.free}
              </p>
            </div>
          </div>

          {/* User info */}
          <div className="px-3 py-3 border-t border-white/6">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/80 truncate">
                  {user?.full_name}
                </p>
                <p className="text-[10px] text-white/30 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-white/50 rounded-lg hover:bg-white/4 hover:text-white/80 transition-all mb-1"
            >
              <UserCog className="w-3.5 h-3.5" />
              الملف الشخصي
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-red-400/70 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* ══ Mobile Header ══ */}
        <div className="flex-1 flex flex-col">
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0e1015]/90 backdrop-blur-xl border-b border-white/6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white/40 hover:text-white/70 transition-colors"
              aria-expanded={sidebarOpen}
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              ويب فلو
            </span>
            <div className="w-5" />
          </header>

          {/* ══ Mobile Sidebar Overlay ══ */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSidebarOpen(false);
                  }}
                />
                <motion.aside
                  initial={{ x: 100 }}
                  animate={{ x: 0 }}
                  exit={{ x: 100 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="fixed top-0 right-0 bottom-0 w-64 bg-[#0e1015] z-50 lg:hidden flex flex-col border-l border-white/6"
                  role="dialog"
                  aria-modal="true"
                  aria-label="قائمة التنقل"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                    <span className="font-bold text-sm bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                      ويب فلو
                    </span>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-white/40 hover:text-white/70 transition-colors"
                      aria-label="إغلاق القائمة"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <nav className="flex-1 p-3 space-y-0.5">
                    {navItems.map((item) => {
                      const active =
                        location.pathname === item.path ||
                        (item.path !== "/dashboard" &&
                          location.pathname.startsWith(item.path));
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-[13px] ${
                            active
                              ? "bg-violet-500/15 text-violet-400"
                              : "text-white/50 hover:bg-white/4"
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="p-3 border-t border-white/6">
                    <div className="flex items-center gap-2.5 mb-2.5 px-1">
                      <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400">
                        {user?.full_name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-white/80 truncate">
                          {user?.full_name}
                        </p>
                        <p className="text-[9px] text-white/30 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-white/50 rounded-lg hover:bg-white/4 hover:text-white/80 transition-all mb-1"
                    >
                      <UserCog className="w-3.5 h-3.5" />
                      الملف الشخصي
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-red-400/70 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      تسجيل الخروج
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* ══ Main Content ══ */}
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
