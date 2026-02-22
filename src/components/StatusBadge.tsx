"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { GoalStatus, ProjectStatus } from "@/types";

interface StatusBadgeProps {
  status: GoalStatus | ProjectStatus;
  translationKey: "goal" | "project";
}

export default function StatusBadge({ status, translationKey }: StatusBadgeProps) {
  const t = useTranslations(translationKey);

  const getStatusColor = () => {
    switch (status) {
      case "notStarted":
        return "bg-track/80 text-text-muted border-border";
      case "inProgress":
        return "bg-primary text-white border-primary-dark";
      case "completed":
        return "bg-accent text-white border-accent-dark ";
      default:
        return "bg-track/80 text-text-muted border-border";
    }
  };

  return (
    <motion.span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black border-2 ${getStatusColor()}`}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {t(`status.${status}`)}
    </motion.span>
  );
}
