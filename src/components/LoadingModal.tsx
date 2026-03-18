"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function LoadingModal({ isOpen, message }: LoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          {/* Flying mascot */}
          <motion.div
            animate={{
              y: [0, -18, 0, -12, 0],
              x: [0, 10, -10, 8, 0],
              rotate: [0, 5, -5, 3, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-28 h-28 mb-6"
          >
            <Image
              src="/img/sprout_cheerful.png"
              alt="Loading"
              fill
              className="object-contain drop-shadow-lg"
            />
          </motion.div>

          {/* Pulsing dots */}
          <div className="flex gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2.5 h-2.5 rounded-full bg-primary"
              />
            ))}
          </div>

          {message && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-text-muted font-medium"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
