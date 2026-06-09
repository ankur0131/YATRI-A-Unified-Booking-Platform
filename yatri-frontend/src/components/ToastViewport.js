import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const iconMap = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const toneMap = {
  error:
    "border-rose-400/25 bg-rose-500/10 text-rose-50 shadow-[0_18px_40px_rgba(244,63,94,0.18)]",
  success:
    "border-emerald-400/25 bg-emerald-500/10 text-emerald-50 shadow-[0_18px_40px_rgba(16,185,129,0.18)]",
  info:
    "border-orange-300/25 bg-orange-400/10 text-orange-50 shadow-[0_18px_40px_rgba(255,153,51,0.2)]",
};

function ToastViewport({ toasts, removeToast, theme }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-auto rounded-2xl border p-4 backdrop-blur-xl ${
                theme === "light" ? "glass-card-light" : "glass-card"
              } ${toneMap[toast.type] || toneMap.info}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl bg-white/10 p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.message ? (
                    <p className="mt-1 text-sm opacity-80">{toast.message}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full p-1.5 text-current/70 transition hover:bg-white/10 hover:text-current"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default ToastViewport;
