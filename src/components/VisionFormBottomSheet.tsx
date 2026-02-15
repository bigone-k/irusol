"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FiSave } from "react-icons/fi";
import { useVisionStore } from "@/store/useVisionStore";
import { useToastStore } from "@/store/useToastStore";
import BottomSheetModal from "@/components/BottomSheetModal";
import FormInput from "@/components/FormInput";
import FormTextarea from "@/components/FormTextarea";

interface VisionFormBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisionFormBottomSheet({
  isOpen,
  onClose,
}: VisionFormBottomSheetProps) {
  const t = useTranslations("vision");
  const vision = useVisionStore((state) => state.vision);
  const setVision = useVisionStore((state) => state.setVision);
  const updateVision = useVisionStore((state) => state.updateVision);
  const { success, error } = useToastStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const isEditMode = !!vision;

  useEffect(() => {
    if (vision) {
      setTitle(vision.title);
      setDescription(vision.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [vision, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      error(t("titleRequired"));
      return;
    }

    if (isEditMode) {
      updateVision({
        title: title.trim(),
        description: description.trim(),
      });
      success(t("visionUpdated"));
    } else {
      setVision({
        title: title.trim(),
        description: description.trim(),
      });
      success(t("visionCreated"));
    }

    onClose();
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t("editVision") : t("createVision")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <FormInput
          label={t("visionTitle")}
          value={title}
          onChange={setTitle}
          placeholder={t("visionTitlePlaceholder")}
          required
          autoFocus
        />

        {/* Description */}
        <FormTextarea
          label={t("visionDescriptionLabel")}
          value={description}
          onChange={setDescription}
          placeholder={t("visionDescriptionPlaceholder")}
          rows={4}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:from-primary-dark hover:to-primary transition-all flex items-center justify-center gap-2"
        >
          <FiSave size={20} />
          {isEditMode ? t("saveChanges") : t("createVision")}
        </button>
      </form>
    </BottomSheetModal>
  );
}
