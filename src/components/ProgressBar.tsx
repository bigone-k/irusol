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
    <div className={`${height} gummy-progress-track`}>
      <motion.div
        className={`gummy-progress-bar ${color === 'bg-primary' ? 'text-primary' : color === 'bg-accent' ? 'text-accent' : color === 'bg-secondary' ? 'text-secondary' : 'text-primary'}`}
        initial={animated ? { width: 0 } : undefined}
        animate={{ width: `${progress}%` }}
        transition={
          animated
            ? { duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }
            : undefined
        }
      />
    </div>
  );
}
