import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-bg text-text-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-border sticky top-0 z-30 bg-dark-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text-static">
              ويب فلو
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/about"
              className="text-sm text-text-muted hover:text-text-primary transition-colors hidden sm:inline"
            >
              من نحن
            </Link>
            <Link
              to="/contact"
              className="text-sm text-text-muted hover:text-text-primary transition-colors hidden sm:inline"
            >
              تواصل معنا
            </Link>
            <Link
              to="/"
              className="text-sm text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              <ArrowRight className="w-4 h-4" /> الرئيسية
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} منشئ ويب فلو. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/about"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              من نحن
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              الخصوصية
            </Link>
            <Link
              to="/contact"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
