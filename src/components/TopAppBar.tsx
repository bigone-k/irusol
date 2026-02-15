"use client";

import { useState } from "react";
import { FiMenu, FiSearch, FiPlus, FiChevronLeft } from "react-icons/fi";
import Sidebar from "./Sidebar";

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  showMenu?: boolean;
  showAdd?: boolean;
  onAdd?: () => void;
}

export default function TopAppBar({
  title,
  showBack = false,
  onBack,
  showSearch = false,
  showMenu = false,
  showAdd = false,
  onAdd,
}: TopAppBarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-app-bar bg-background-surface border-b border shadow-sm">
        <div className="max-w-md mx-auto h-14 px-4 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center">
            {showBack && onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center text-text hover:bg-primary/5 rounded-full transition-colors"
                aria-label="Go back"
              >
                <FiChevronLeft size={24} />
              </button>
            )}
            {showMenu && !showBack && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-text hover:bg-primary/5 rounded-full transition-colors"
                aria-label="Menu"
              >
                <FiMenu size={20} />
              </button>
            )}
          </div>

        {/* Center Section - Title */}
        <h1 className="text-lg font-bold text-text truncate px-2">
          {title}
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-2">
        </div>
      </div>
    </header>

    {/* Sidebar */}
    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
