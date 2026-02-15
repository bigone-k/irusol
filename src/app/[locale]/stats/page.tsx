"use client";

import { FiBarChart2, FiTrendingUp, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";

export default function StatsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center"
            >
              <FiBarChart2 className="text-primary-dark" size={48} />
            </motion.div>

            {/* Decorative icons */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="absolute -top-2 -right-2 w-10 h-10 bg-secondary rounded-full flex items-center justify-center"
            >
              <FiTrendingUp className="text-accent" size={20} />
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              className="absolute -bottom-2 -left-2 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"
            >
              <FiAward className="text-primary-dark" size={20} />
            </motion.div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-text mb-3">
          통계 기능
        </h1>
        <p className="text-xl text-text-muted mb-6">
          Statistics Feature
        </p>

        {/* Message */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border-2 border mb-6">
          <p className="text-lg font-semibold text-text mb-2">
            🚧 현재 기능 개발 중입니다
          </p>
          <p className="text-sm text-primary-dark">
            Feature under development
          </p>
        </div>

        {/* Info */}
        <div className="text-left space-y-2 text-sm text-text-muted">
          <p className="flex items-start gap-2">
            <span className="text-primary-dark">📊</span>
            <span>일일/주간/월간 통계 차트</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-primary-dark">🎯</span>
            <span>목표 달성률 분석</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-primary-dark">📈</span>
            <span>성장 추이 그래프</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-primary-dark">🏆</span>
            <span>업적 및 히스토리</span>
          </p>
        </div>

        {/* Coming Soon Badge */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-6 inline-block"
        >
          <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
            Coming Soon! 곧 만나요 ✨
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
