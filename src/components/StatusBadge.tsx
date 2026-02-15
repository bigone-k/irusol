"use client";

import { useTranslations } from "next-intl";
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
        return "bg-track text-text-muted border-border shadow-sm";
      case "inProgress":
        return "bg-primary text-white border-primary-dark shadow-md";
      case "completed":
        return "bg-accent text-white border-accent shadow-md";
      default:
        return "bg-track text-text-muted border-border shadow-sm";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor()}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}
