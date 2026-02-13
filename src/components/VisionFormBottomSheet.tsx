"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave } from "react-icons/fi";
import { useVisionStore } from "@/store/useVisionStore";
import { useToastStore } from "@/store/useToastStore";

interface VisionFormBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisionFormBottomSheet({
  isOpen,
  onClose,
}: VisionFormBottomSheetProps) {
  const t = useTranslations("vision");
  const vision = useVisionStore((state) => state.vision);
  const setVision = useVisionStore((state) => state.setVision);
  const updateVision = useVisionStore((state) => state.updateVision);
  const { success, error } = useToastStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const isEditMode = !!vision;

  useEffect(() => {
    if (vision) {
      setTitle(vision.title);
      setDescription(vision.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [vision, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      error(t("titleRequired"));
      return;
    }

    if (isEditMode) {
      updateVision({
        title: title.trim(),
        description: description.trim(),
      });
      success(t("visionUpdated"));
    } else {
      setVision({
        title: title.trim(),
        description: description.trim(),
      });
      success(t("visionCreated"));
    }

    onClose();
  };

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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vision-form-title"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10 rounded-t-3xl">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3
                  id="vision-form-title"
                  className="text-xl font-bold text-gray-800"
                >
                  {isEditMode ? t("editVision") : t("createVision")}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close dialog"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("visionTitle")} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("visionTitlePlaceholder")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("visionDescriptionLabel")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("visionDescriptionPlaceholder")}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                >
                  <FiSave size={20} />
                  {isEditMode ? t("saveChanges") : t("createVision")}
                </button>
              </form>

              {/* Safe area for mobile */}
              <div className="pb-safe" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
