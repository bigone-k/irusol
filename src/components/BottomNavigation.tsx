"use client";

import { Link, usePathname } from "@/i18n/routing";
import { FiTarget, FiBriefcase, FiCheckCircle, FiList } from "react-icons/fi";
import { useTranslations } from "next-intl";

export default function BottomNavigation() {
  const pathname = usePathname();
  const t = useTranslations();

  const tabs = [
    { id: "goals", label: t("nav.goals"), icon: FiTarget, href: "/" },
    { id: "projects", label: t("nav.projects"), icon: FiBriefcase, href: "/projects" },
    { id: "today", label: t("nav.today"), icon: FiCheckCircle, href: "/today" },
    { id: "todos", label: t("nav.todos"), icon: FiList, href: "/todos" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-nav">
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
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-500 hover:text-gray-700"
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
