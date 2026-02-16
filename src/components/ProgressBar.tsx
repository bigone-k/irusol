"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: string;
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  color = "bg-primary",
  height = "h-3",
  animated = true,
}: ProgressBarProps) {
  return (
    <div className={`${height} bg-track rounded-full overflow-hidden`}>
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={animated ? { width: 0 } : undefined}
        animate={{ width: `${progress}%` }}
        transition={animated ? { duration: 0.5, ease: "easeOut" } : undefined}
      />
    </div>
  );
}
