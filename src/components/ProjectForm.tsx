"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import BottomSheetModal from "@/components/BottomSheetModal";
import FormInput from "@/components/FormInput";
import FormTextarea from "@/components/FormTextarea";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGoalId?: string;
}

export default function ProjectForm({
  isOpen,
  onClose,
  defaultGoalId,
}: ProjectFormProps) {
  const t = useTranslations();
  const goals = useGoalStore((state) => state.goals);
  const addProject = useProjectStore((state) => state.addProject);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalId, setGoalId] = useState(defaultGoalId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !goalId) return;

    addProject({
      goalId,
      title: title.trim(),
      description: description.trim(),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setGoalId(defaultGoalId || "");
    onClose();
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("project.create")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            {t("goal.title")} *
          </label>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full px-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
            required
          >
            <option value="">{t("task.selectProject")}</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </div>

        <FormInput
          label={t("task.title")}
          value={title}
          onChange={setTitle}
          placeholder="예: 매일 30분 운동하기"
          required
          autoFocus
        />

        <FormTextarea
          label={t("task.description")}
          value={description}
          onChange={setDescription}
          placeholder="프로젝트에 대한 상세 설명"
          rows={3}
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:from-primary-dark hover:to-primary transition-all"
        >
          {t("project.create")}
        </button>
      </form>
    </BottomSheetModal>
  );
}
