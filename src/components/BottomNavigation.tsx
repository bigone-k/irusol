"use client";

import { Link, usePathname } from "@/i18n/routing";
import { FiTarget, FiBriefcase, FiCheckCircle, FiList, FiCalendar } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function BottomNavigation() {
  const pathname = usePathname();
  const t = useTranslations();

  const tabs = [
    { id: "goals", label: t("nav.goals"), icon: FiTarget, href: "/goals" },
    { id: "projects", label: t("nav.projects"), icon: FiBriefcase, href: "/projects" },
    { id: "calendar", label: t("calendar.title"), icon: FiCalendar, href: "/calendar" },
    { id: "quest", label: t("nav.quest"), icon: FiList, href: "/quest" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-surface/95 backdrop-blur-md border-t border z-nav">
      <div className="max-w-md mx-auto flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.id}
              href={tab.href}
            >
              <motion.div
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-0 ${
                  isActive
                    ? "text-white bg-primary"
                    : "text-text-muted hover:text-text hover:bg-primary/10"
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="text-xl flex-shrink-0" strokeWidth={2.5} />
                <span className="text-xs font-bold truncate w-full text-center">
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
