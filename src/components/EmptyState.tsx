"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
}

export default function EmptyState({ title, description, icon = "📝" }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-text-muted">
      <p className="text-4xl mb-3">{icon}</p>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
}
