import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowRight, SearchX, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg relative z-10"
      >
        {/* 404 Number */}
        <div className="relative mb-8">
          <span className="text-[140px] md:text-[180px] font-bold gradient-text leading-none select-none opacity-20">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center backdrop-blur-sm"
            >
              <SearchX className="w-12 h-12 text-primary-light" />
            </motion.div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">الصفحة غير موجودة</h1>
        <p className="text-text-secondary text-lg mb-8 leading-relaxed">
          الصفحة اللي تبحث عنها ما لقيناها — ممكن تكون حُذفت أو الرابط غير صحيح
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary flex items-center gap-2 px-6 py-3"
          >
            <Home className="w-4 h-4" />
            الصفحة الرئيسية
          </Link>
          <Link
            to="/dashboard"
            className="btn-outline flex items-center gap-2 px-6 py-3"
          >
            <Sparkles className="w-4 h-4" />
            لوحة التحكم
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-6 text-sm text-text-muted hover:text-primary-light transition-colors flex items-center gap-1 mx-auto"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          ارجع للصفحة السابقة
        </button>
      </motion.div>
    </div>
  );
}
