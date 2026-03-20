"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePlayerStore } from "@/store/usePlayerStore";
import { getStageImagePath } from "@/lib/evolution";
import Image from "next/image";

interface CharacterAvatarProps {
  size?: number;
  className?: string;
}

const wiggleAnimation = {
  rotate: [0, -8, 8, -6, 6, -3, 3, 0],
  transition: { duration: 0.6, ease: "easeInOut" },
};

export default function CharacterAvatar({
  size = 120,
  className = "",
}: CharacterAvatarProps) {
  const t = useTranslations();
  const stage = usePlayerStore((s) => s.stage);
  const [wiggleKey, setWiggleKey] = useState(0);

  const handleTap = useCallback(() => {
    setWiggleKey((k) => k + 1);
  }, []);

  return (
    <motion.div
      key={wiggleKey}
      animate={wiggleKey > 0 ? wiggleAnimation : undefined}
      onClick={handleTap}
      className={`cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={getStageImagePath(stage)}
        alt={t(`character.stage.${stage}`)}
        width={size}
        height={size}
        className="object-contain w-full h-full pointer-events-none"
        priority
        draggable={false}
      />
    </motion.div>
  );
}
