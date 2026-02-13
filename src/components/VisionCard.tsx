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
        className="relative bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 rounded-2xl p-6 shadow-lg border-2 border-purple-200 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FiPlus size={24} className="text-purple-700" />
            <h3 className="text-lg font-bold text-purple-800">
              {t("createVision")}
            </h3>
          </div>
          <p className="text-sm text-purple-600">
            {t("visionDescription")}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 rounded-2xl p-6 shadow-lg border-2 border-purple-200 overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
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
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
            {t("vision")}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Edit vision"
          >
            <FiEdit2 size={16} className="text-purple-600" />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {vision.title}
        </h2>

        {vision.description && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {vision.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
