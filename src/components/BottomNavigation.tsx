"use client";

import { Link, usePathname } from "@/i18n/routing";
import { FiTarget, FiBriefcase, FiCheckCircle, FiList } from "react-icons/fi";
import { useTranslations } from "next-intl";

export default function BottomNavigation() {
  const pathname = usePathname();
  const t = useTranslations();

  const tabs = [
    { id: "goals", label: t("nav.goals"), icon: FiTarget, href: "/goals" },
    { id: "projects", label: t("nav.projects"), icon: FiBriefcase, href: "/projects" },
    { id: "todos", label: t("nav.todos"), icon: FiList, href: "/todos" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-surface border-t border shadow-lg z-nav">
      <div className="max-w-md mx-auto flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Icon className="text-xl flex-shrink-0" />
              <span className="text-xs font-medium truncate w-full text-center">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
