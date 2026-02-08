"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { FaTimes, FaFlag, FaFolderOpen, FaCheckSquare } from "react-icons/fa";
import { useTranslations } from "next-intl";
import GoalForm from "@/components/GoalForm";
import ProjectForm from "@/components/ProjectForm";
import AddTaskButton from "@/components/AddTaskButton";

type CreateOption = "goal" | "project" | "task" | null;

export default function FloatingAddButton() {
  const t = useTranslations();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<CreateOption>(null);

  const handleOptionSelect = (option: CreateOption) => {
    setSelectedOption(option);
    setIsBottomSheetOpen(false);
  };

  const handleCloseForm = () => {
    setSelectedOption(null);
  };

  const options = [
    {
      type: "goal" as const,
      title: t("goal.create"),
      icon: FaFlag,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      type: "project" as const,
      title: t("project.create"),
      icon: FaFolderOpen,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      type: "task" as const,
      title: t("task.create"),
      icon: FaCheckSquare,
      gradient: "from-green-500 to-teal-500",
    },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsBottomSheetOpen(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full shadow-lg flex items-center justify-center z-fab"
      >
        <FiPlus size={24} />
      </motion.button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isBottomSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBottomSheetOpen(false)}
              className="fixed inset-0 bg-black/50 z-modal"
            />

            {/* Bottom Sheet Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-modal"
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex justify-between items-center px-6 pb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {t("common.create")}
                </h3>
                <button
                  onClick={() => setIsBottomSheetOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Options */}
              <div className="px-6 pb-8 space-y-3">
                {options.map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.type}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionSelect(option.type)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${option.gradient} text-white shadow-md hover:shadow-lg transition-all`}
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon size={24} />
                      </div>
                      <span className="text-lg font-semibold">{option.title}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Safe area for mobile */}
              <div className="pb-safe" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Forms */}
      <GoalForm
        isOpen={selectedOption === "goal"}
        onClose={handleCloseForm}
      />
      <ProjectForm
        isOpen={selectedOption === "project"}
        onClose={handleCloseForm}
      />
      <AddTaskButton
        hideButton={true}
        externalIsOpen={selectedOption === "task"}
        onExternalClose={handleCloseForm}
      />
    </>
  );
}
