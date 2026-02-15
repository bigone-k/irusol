"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { ReactNode } from "react";

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showHandleBar?: boolean;
  maxHeight?: string;
}

export default function BottomSheetModal({
  isOpen,
  onClose,
  title,
  children,
  showHandleBar = true,
  maxHeight = "max-h-[90vh]",
}: BottomSheetModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 ${maxHeight} overflow-y-auto`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Handle Bar */}
            {showHandleBar && (
              <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10 rounded-t-3xl">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2
                id="modal-title"
                className="text-xl font-bold text-gray-900"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                aria-label="Close dialog"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {children}
            </div>

            {/* Safe area for mobile */}
            <div className="pb-safe" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
