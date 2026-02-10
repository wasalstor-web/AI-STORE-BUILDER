import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = "تأكيد",
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colors = {
    danger: {
      icon: "text-error bg-error/10 border-error/20",
      btn: "bg-error hover:bg-error/90 text-white",
    },
    warning: {
      icon: "text-warning bg-warning/10 border-warning/20",
      btn: "bg-warning hover:bg-warning/90 text-black",
    },
    info: {
      icon: "text-info bg-info/10 border-info/20",
      btn: "bg-primary hover:bg-primary/90 text-white",
    },
  };

  const c = colors[variant];

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="glass-card p-6 max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-12 h-12 rounded-xl ${c.icon} border flex items-center justify-center mx-auto mb-4`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">{title}</h3>
            <p className="text-sm text-text-secondary mb-5 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                className={`${c.btn} flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]`}
              >
                {confirmLabel}
              </button>
              <button
                onClick={onCancel}
                className="btn-outline flex-1 py-2.5 rounded-xl text-sm"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
