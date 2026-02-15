"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  colorFrom?: string;
  colorTo?: string;
  height?: string;
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  colorFrom = "from-purple-500",
  colorTo = "to-pink-500",
  height = "h-3",
  animated = true,
}: ProgressBarProps) {
  return (
    <div className={`${height} bg-gray-200 rounded-full overflow-hidden`}>
      <motion.div
        className={`h-full bg-gradient-to-r ${colorFrom} ${colorTo} rounded-full`}
        initial={animated ? { width: 0 } : undefined}
        animate={{ width: `${progress}%` }}
        transition={animated ? { duration: 0.5, ease: "easeOut" } : undefined}
      />
    </div>
  );
}
