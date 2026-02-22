"use client";

import { useTranslations } from "next-intl";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";
import { FiEdit2, FiPlus } from "react-icons/fi";

interface VisionCardProps {
  onClick: () => void;
}

export default function VisionCard({ onClick }: VisionCardProps) {
  const t = useTranslations("vision");
  const vision = useVisionStore((state) => state.vision);

  if (!vision) {
    return (
      <motion.div
        onClick={onClick}
        className="relative gummy-card p-6 overflow-hidden cursor-pointer jelly-bounce"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-secondary0 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center "
              whileHover={{ scale: 1.1, rotate: 90 }}
            >
              <FiPlus size={24} className="text-primary-dark" />
            </motion.div>
            <h3 className="text-xl font-black text-text ">
              {t("createVision")}
            </h3>
          </div>
          <p className="text-sm text-primary-dark font-semibold">
            {t("visionDescription")}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative gummy-card p-6 overflow-hidden bg-primary/10 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Image (if exists) */}
      {vision.imageUrl && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-10">
          <img
            src={vision.imageUrl}
            alt={vision.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-secondary0 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-primary-dark uppercase tracking-wide">
            {t("vision")}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="p-2 hover:bg-background-surface/50 rounded-lg transition-colors"
            aria-label="Edit vision"
          >
            <FiEdit2 size={16} className="text-primary-dark" />
          </button>
        </div>

        <h2 className="text-2xl font-black text-text mb-2 ">
          {vision.title}
        </h2>

        {vision.description && (
          <p className="text-sm text-text leading-relaxed">
            {vision.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
