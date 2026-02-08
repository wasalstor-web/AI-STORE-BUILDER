import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bot,
  Palette,
  Crown,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

const navItems = [
  { path: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/stores/create', label: 'إنشاء متجر', icon: PlusCircle },
  { path: '/stores/ai-builder', label: 'بناء بالـ AI', icon: Bot },
];

const secondaryItems = [
  { path: '/stores/create', label: 'معرض القوالب', icon: Palette },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* ══ Sidebar (Desktop) ══ */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-surface border-l border-dark-border">
        {/* Logo */}
        <div className="p-6 border-b border-dark-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/15">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AI بلدر</span>
            <span className="badge badge-primary text-[9px]">Pro</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] text-text-muted font-medium px-4 mb-2 uppercase tracking-wider">الرئيسية</p>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                  active
                    ? 'bg-primary/20 text-primary-light border border-primary/30'
                    : 'text-text-secondary hover:bg-dark-hover hover:text-text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 pb-1">
            <p className="text-[10px] text-text-muted font-medium px-4 mb-2 uppercase tracking-wider">أدوات</p>
          </div>
          {secondaryItems.map((item) => (
            <Link key={item.label} to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm text-text-secondary hover:bg-dark-hover hover:text-text-primary">
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Plan badge */}
        <div className="px-4 pb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-semibold">الخطة المجانية</span>
              <span className="badge badge-accent text-[8px] mr-auto">ترقية</span>
            </div>
            <p className="text-[10px] text-text-muted">12 قالب • 21 قسم • AI</p>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger rounded-lg hover:bg-danger/10 transition-colors btn-ghost"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ══ Mobile Header ══ */}
      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center justify-between p-4 bg-dark-surface/80 backdrop-blur-xl border-b border-dark-border">
          <button onClick={() => setSidebarOpen(true)} className="text-text-secondary">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold gradient-text">AI بلدر</span>
          <div className="w-6" />
        </header>

        {/* ══ Mobile Sidebar Overlay ══ */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                exit={{ x: 100 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed top-0 right-0 bottom-0 w-72 bg-dark-surface z-50 lg:hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-dark-border">
                  <span className="font-bold gradient-text">AI بلدر</span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          active
                            ? 'bg-primary/20 text-primary-light'
                            : 'text-text-secondary hover:bg-dark-hover'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-dark-border">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger rounded-lg hover:bg-danger/10"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ══ Main Content ══ */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
