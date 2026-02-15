"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiCheck } from "react-icons/fi";
import Image from "next/image";
import type { Difficulty } from "@/types";

export default function Onboarding() {
  const t = useTranslations();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [habitTitle, setHabitTitle] = useState("");
  const [habitDifficulty, setHabitDifficulty] = useState<Difficulty>("normal");

  const { setNickname: saveNickname, completeOnboarding } =
    useOnboardingStore();
  const addGoal = useGoalStore((state) => state.addGoal);
  const addProject = useProjectStore((state) => state.addProject);
  const addTask = useTaskStore((state) => state.addTask);

  const handleComplete = () => {
    // Save nickname
    if (nickname.trim()) {
      saveNickname(nickname.trim());
    }

    // Create initial Goal, Project, Habit if provided
    let goalId: string | undefined;
    let projectId: string | undefined;

    if (goalTitle.trim()) {
      const newGoal = {
        title: goalTitle.trim(),
        description: "",
      };
      addGoal(newGoal);
      // Get the newly created goal ID (last goal in the array)
      const goals = useGoalStore.getState().goals;
      goalId = goals[goals.length - 1]?.id;
    }

    if (projectTitle.trim() && goalId) {
      const newProject = {
        goalId,
        title: projectTitle.trim(),
        description: "",
      };
      addProject(newProject);
      const projects = useProjectStore.getState().projects;
      projectId = projects[projects.length - 1]?.id;
    }

    if (habitTitle.trim()) {
      addTask({
        title: habitTitle.trim(),
        description: "",
        type: "habit",
        difficulty: habitDifficulty,
        goalId,
        projectId,
      });
    }

    completeOnboarding();
  };

  const steps = [
    // Step 0: Welcome
    {
      title: t("onboarding.welcome"),
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative w-48 h-48">
            <Image
              src="/img/level_1_egg.png"
              alt="Welcome"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-text-muted text-lg">
            습관을 키우고 캐릭터를 성장시키세요!
          </p>
        </div>
      ),
      canNext: true,
    },
    // Step 1: Nickname
    {
      title: t("onboarding.nickname"),
      content: (
        <div className="space-y-4">
          <p className="text-text-muted">당신의 닉네임을 알려주세요</p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t("onboarding.enterNickname")}
            className="w-full px-4 py-3 border-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            autoFocus
          />
        </div>
      ),
      canNext: nickname.trim().length > 0,
    },
    // Step 2: First Goal (Optional)
    {
      title: t("onboarding.setupGoal"),
      content: (
        <div className="space-y-4">
          <p className="text-text-muted text-sm">
            목표를 설정하면 더욱 체계적으로 습관을 관리할 수 있어요
          </p>
          <input
            type="text"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            placeholder="예: 건강한 생활 습관 만들기"
            className="w-full px-4 py-3 border-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      ),
      canNext: true,
      canSkip: true,
    },
    // Step 3: First Project (Optional, only if Goal is set)
    {
      title: t("onboarding.setupProject"),
      content: (
        <div className="space-y-4">
          <p className="text-text-muted text-sm">
            프로젝트는 목표를 달성하기 위한 구체적인 계획이에요
          </p>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="예: 매일 30분 운동하기"
            className="w-full px-4 py-3 border-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      ),
      canNext: true,
      canSkip: true,
      shouldShow: goalTitle.trim().length > 0,
    },
    // Step 4: First Habit (Optional)
    {
      title: t("onboarding.setupHabit"),
      content: (
        <div className="space-y-4">
          <p className="text-text-muted text-sm">
            첫 번째 습관을 만들어볼까요?
          </p>
          <input
            type="text"
            value={habitTitle}
            onChange={(e) => setHabitTitle(e.target.value)}
            placeholder="예: 물 8잔 마시기"
            className="w-full px-4 py-3 border-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
          />
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              난이도
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "normal", "hard"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setHabitDifficulty(diff)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    habitDifficulty === diff
                      ? "bg-primary text-white"
                      : "bg-track text-text-muted hover:bg-track"
                  }`}
                >
                  {t(`task.difficulty.${diff}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      canNext: true,
      canSkip: true,
    },
  ];

  // Filter out steps that shouldn't show
  const visibleSteps = steps.filter(
    (step, index) => step.shouldShow !== false
  );
  const currentStep = visibleSteps[step];
  const isLastStep = step === visibleSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-primary/10 to-primary/5 z-50">
      <div className="max-w-md mx-auto h-full flex flex-col p-6">
        {/* Progress Bar */}
        <div className="mb-8 mt-8">
          <div className="flex justify-between mb-2">
            {visibleSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full mx-1 transition-colors ${
                  index <= step ? "bg-secondary0" : "bg-track"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-text-muted text-center">
            {step + 1} / {visibleSteps.length}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-bold text-text mb-6">
                {currentStep.title}
              </h2>
              <div className="flex-1">{currentStep.content}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-6">
          <button
            onClick={handleNext}
            disabled={!currentStep.canNext}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              currentStep.canNext
                ? "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-accent"
                : "bg-border cursor-not-allowed"
            }`}
          >
            {isLastStep ? (
              <>
                <FiCheck size={20} />
                {t("onboarding.start")}
              </>
            ) : (
              <>
                {t("common.next")}
                <FiChevronRight size={20} />
              </>
            )}
          </button>

          {currentStep.canSkip && (
            <button
              onClick={handleSkip}
              className="w-full py-3 text-text-muted hover:text-text font-semibold transition-colors"
            >
              {t("common.skip")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
