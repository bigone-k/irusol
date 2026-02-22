"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { usePathname } from "@/i18n/routing";
import GoalForm from "@/components/GoalForm";
import ProjectForm from "@/components/ProjectForm";
import AddTaskButton from "@/components/AddTaskButton";

type CreateOption = "goal" | "project" | "task" | null;

export default function FloatingAddButton() {
  const pathname = usePathname();
  const [selectedOption, setSelectedOption] = useState<CreateOption>(null);

  // Determine which form to open based on current route
  const getFormTypeFromPath = (): CreateOption => {
    if (pathname.includes("/goals")) return "goal";
    if (pathname.includes("/projects")) return "project";
    return "task"; // Default: /quest and others
  };

  const handleButtonClick = () => {
    const formType = getFormTypeFromPath();
    setSelectedOption(formType);
  };

  const handleCloseForm = () => {
    setSelectedOption(null);
  };

  return (
    <>
      {/* Floating Action Button - Gummy 3D Style */}
      <motion.button
        whileHover={{
          scale: 1.15,
          y: -4,
          rotate: 90
        }}
        whileTap={{ scale: 0.9 }}
        onClick={handleButtonClick}
        className="fixed bottom-20 right-6 w-16 h-16 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center z-fab transition-all duration-300 border-2 border-white/50 glossy animate-pulse-glow"
      >
        <FiPlus size={28} strokeWidth={3} className="" />
      </motion.button>

      {/* Forms as Bottom Sheets */}
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
