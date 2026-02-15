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
        return "bg-gray-200 text-gray-800 border-gray-400 shadow-sm";
      case "inProgress":
        return "bg-blue-500 text-white border-blue-600 shadow-md";
      case "completed":
        return "bg-green-500 text-white border-green-600 shadow-md";
      default:
        return "bg-gray-200 text-gray-800 border-gray-400 shadow-sm";
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
