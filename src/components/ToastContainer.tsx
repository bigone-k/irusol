"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-accent text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-secondary text-white";
      case "info":
      default:
        return "bg-primary text-white";
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case "success":
        return <FiCheckCircle size={20} />;
      case "error":
        return <FiAlertCircle size={20} />;
      case "warning":
        return <FiAlertTriangle size={20} />;
      case "info":
      default:
        return <FiInfo size={20} />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`${getToastStyles(
              toast.type
            )} rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex-shrink-0">{getToastIcon(toast.type)}</div>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:bg-background-surface/20 rounded p-1 transition-colors"
              aria-label="Close notification"
            >
              <FiX size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
