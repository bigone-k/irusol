"use client";

import type { TabType } from "@/types";
import { FaCheckCircle, FaCalendarDay, FaListUl, FaGift, FaUsers } from "react-icons/fa";

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    { id: "habits" as TabType, label: "Habits", icon: FaCheckCircle },
    { id: "dailies" as TabType, label: "Dailies", icon: FaCalendarDay },
    { id: "todos" as TabType, label: "To Do's", icon: FaListUl },
    { id: "rewards" as TabType, label: "Rewards", icon: FaGift },
    { id: "social" as TabType, label: "Social", icon: FaUsers },
  ];

  return (
    <div className="bg-background-surface border border rounded-xl shadow-sm p-2">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Icon className="text-xl" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
