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
    return "task"; // Default: /todos and others
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
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleButtonClick}
        className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full shadow-lg flex items-center justify-center z-fab"
      >
        <FiPlus size={24} />
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
