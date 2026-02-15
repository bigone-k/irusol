"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useGoalStore } from "@/store/useGoalStore";
import BottomSheetModal from "@/components/BottomSheetModal";
import FormInput from "@/components/FormInput";
import FormTextarea from "@/components/FormTextarea";

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalForm({ isOpen, onClose }: GoalFormProps) {
  const t = useTranslations();
  const addGoal = useGoalStore((state) => state.addGoal);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      description: description.trim(),
    });

    // Reset form
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("goal.create")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label={t("task.title")}
          value={title}
          onChange={setTitle}
          placeholder="예: 건강한 생활 습관 만들기"
          required
          autoFocus
        />

        <FormTextarea
          label={t("task.description")}
          value={description}
          onChange={setDescription}
          placeholder="목표에 대한 상세 설명"
          rows={3}
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          {t("goal.create")}
        </button>
      </form>
    </BottomSheetModal>
  );
}
