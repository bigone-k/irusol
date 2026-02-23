"use client";

import { motion } from "framer-motion";
import { FiTarget } from "react-icons/fi";

export default function ObjectiveCard() {
  const objectives = [
    {
      id: "1",
      title: "첫 습관 만들기",
      description: "습관 관리를 시작하세요",
      completed: false,
      reward: 10,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-secondary/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-secondary-dark/20 jelly-bounce"
    >
      <h3 className="text-xl font-black text-text mb-4 flex items-center gap-2">
        <FiTarget size={20} className="text-text-muted" />
        초보자 목표
      </h3>
      {objectives.map((obj) => (
        <motion.div
          key={obj.id}
          className="flex items-center gap-3 p-3 bg-background-surface/50 rounded-xl border border-secondary-dark/30"
          whileHover={{ scale: 1.02, x: 4 }}
        >
          <input
            type="checkbox"
            checked={obj.completed}
            readOnly
            className="w-6 h-6 rounded-lg border-2 border-accent cursor-pointer accent-accent"
          />
          <div className="flex-1">
            <p className="text-sm font-bold text-text">{obj.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{obj.description}</p>
          </div>
          <motion.span
            className="text-xs text-primary-dark font-black px-3 py-1.5 bg-primary/20 rounded-full border border-primary/30"
            whileHover={{ scale: 1.1 }}
          >
            +{obj.reward} XP
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
}
