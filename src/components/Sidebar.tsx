"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiGlobe, FiBarChart2, FiUser, FiSettings } from "react-icons/fi";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations();

  const menuItems = [
    { icon: FiGlobe, label: t("sidebar.language"), href: "/settings/language" },
    { icon: FiBarChart2, label: t("nav.stats"), href: "/stats" },
    { icon: FiUser, label: t("nav.character"), href: "/character" },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-modal"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-background-surface shadow-2xl z-modal"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border">
                <h2 className="text-xl font-bold text-text">DoTo</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center text-text-muted hover:bg-primary/5 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3 px-4 py-3 text-text hover:bg-primary/10 hover:text-primary-dark rounded-lg transition-colors"
                        >
                          <Icon size={20} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border">
                <p className="text-xs text-text-muted text-center">
                  DoTo v1.0.0
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
