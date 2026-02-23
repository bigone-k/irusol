"use client";

import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, icon = "📝" }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-text-muted">
      <div className="flex justify-center items-center mb-3 text-4xl text-text-muted">
        {icon}
      </div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
}
