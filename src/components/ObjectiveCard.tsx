"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ObjectiveCard() {
  const [objectives] = useState([
    {
      id: "1",
      title: "첫 습관 만들기",
      description: "습관 관리를 시작하세요",
      completed: false,
      reward: 10,
    },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-secondary rounded-xl p-4 border-2 border"
    >
      <h3 className="text-lg font-bold text-text mb-2">🎯 초보자 목표</h3>
      {objectives.map((obj) => (
        <div key={obj.id} className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={obj.completed}
            readOnly
            className="w-5 h-5 rounded border-amber-400"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-text">{obj.title}</p>
            <p className="text-xs text-text-muted">{obj.description}</p>
          </div>
          <span className="text-xs text-primary-dark font-bold">+{obj.reward} XP</span>
        </div>
      ))}
    </motion.div>
  );
}
