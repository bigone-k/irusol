"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiCheck,
  FiTarget,
  FiFolder,
  FiZap,
  FiRepeat,
  FiCheckSquare,
} from "react-icons/fi";
import Image from "next/image";

const TOTAL_STEPS = 7;

export default function Onboarding() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");

  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [questTitle, setQuestTitle] = useState("");
  const [questType, setQuestType] = useState<"habit" | "todo">("habit");

  const { setNickname: saveNickname, completeOnboarding } = useOnboardingStore();
  const addGoal = useGoalStore((state) => state.addGoal);
  const addProject = useProjectStore((state) => state.addProject);
  const addTask = useTaskStore((state) => state.addTask);

  const handleComplete = () => {
    if (nickname.trim()) {
      saveNickname(nickname.trim());
    }

    let goalId: string | undefined;
    let projectId: string | undefined;

    if (goalTitle.trim()) {
      addGoal({ title: goalTitle.trim(), description: "" });
      goalId = useGoalStore.getState().goals.slice(-1)[0]?.id;
    }

    if (projectTitle.trim()) {
      addProject({ goalId: goalId ?? "", title: projectTitle.trim(), description: "" });
      projectId = useProjectStore.getState().projects.slice(-1)[0]?.id;
    }

    if (questTitle.trim()) {
      addTask({
        title: questTitle.trim(),
        description: "",
        type: questType,
        goalId,
        projectId,
      });
    }

    completeOnboarding();
  };

  // Per-step config
  const canNext = [
    true,                          // 0: Welcome
    true,                          // 1: Structure
    nickname.trim().length > 0,    // 2: Nickname (required)
    true,                          // 3: Goal (optional)
    true,                          // 4: Project (optional)
    true,                          // 5: Quest (optional)
    true,                          // 6: Complete
  ][step];

  const canSkip = [false, false, false, true, true, true, false][step];
  const isLastStep = step === TOTAL_STEPS - 1;

  // Breadcrumb active index: steps 3,4,5 → 0,1,2
  const breadcrumbActive = step >= 3 && step <= 5 ? step - 3 : null;

  const handleNext = () => {
    if (isLastStep) handleComplete();
    else setStep((s) => s + 1);
  };

  const handleSkip = () => {
    if (isLastStep) handleComplete();
    else setStep((s) => s + 1);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-md mx-auto min-h-full flex flex-col p-6">
        {/* Progress dots */}
        <div className="mb-8 mt-8">
          <div className="flex justify-center gap-1.5 mb-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-8 bg-primary"
                    : i < step
                    ? "w-3 bg-primary/50"
                    : "w-3 bg-track"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-text-muted text-center">
            {step + 1} / {TOTAL_STEPS}
          </p>
        </div>

        {/* Step content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Breadcrumb — steps 3, 4, 5 */}
              {breadcrumbActive !== null && (
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[
                    { label: t("breadcrumbGoal"), Icon: FiTarget },
                    { label: t("breadcrumbProject"), Icon: FiFolder },
                    { label: t("breadcrumbQuest"), Icon: FiZap },
                  ].map(({ label, Icon }, i) => (
                    <div key={i} className="flex items-center">
                      {i > 0 && (
                        <div
                          className={`w-5 h-0.5 ${
                            i <= breadcrumbActive ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          i === breadcrumbActive
                            ? "bg-primary text-white shadow-sm"
                            : i < breadcrumbActive
                            ? "bg-primary/15 text-primary-dark"
                            : "bg-track text-text-muted"
                        }`}
                      >
                        <Icon size={11} />
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 0: Welcome */}
              {step === 0 && (
                <div className="flex flex-col items-center text-center space-y-6 pt-4">
                  <div className="relative w-48 h-48">
                    <Image
                      src="/img/level_1_egg.png"
                      alt="Welcome"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-2">
                      {t("welcome")}
                    </h2>
                    <p className="text-text-muted">{t("welcomeDesc")}</p>
                  </div>
                </div>
              )}

              {/* STEP 1: Structure overview */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-text mb-1">
                    {t("structure")}
                  </h2>
                  <p className="text-text-muted text-sm mb-6">
                    {t("structureDesc")}
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        Icon: FiTarget,
                        color: "bg-primary/10 border-primary/20",
                        iconColor: "text-primary-dark",
                        label: t("breadcrumbGoal"),
                        desc: t("structureGoalDesc"),
                        num: "1",
                      },
                      {
                        Icon: FiFolder,
                        color: "bg-secondary/80 border-secondary-dark/20",
                        iconColor: "text-text",
                        label: t("breadcrumbProject"),
                        desc: t("structureProjectDesc"),
                        num: "2",
                      },
                      {
                        Icon: FiZap,
                        color: "bg-accent/10 border-accent/20",
                        iconColor: "text-accent",
                        label: t("breadcrumbQuest"),
                        desc: t("structureQuestDesc"),
                        num: "3",
                      },
                    ].map(({ Icon, color, iconColor, label, desc, num }, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 ${color}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-background-surface flex items-center justify-center shadow-sm flex-shrink-0">
                          <Icon size={18} className={iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-text-muted opacity-50">
                              {num}
                            </span>
                            <p className="font-bold text-text">{label}</p>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            {desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-center gap-2">
                    <span className="text-sm font-bold text-primary-dark">
                      {t("breadcrumbGoal")}
                    </span>
                    <FiChevronRight size={14} className="text-text-muted" />
                    <span className="text-sm font-bold text-text">
                      {t("breadcrumbProject")}
                    </span>
                    <FiChevronRight size={14} className="text-text-muted" />
                    <span className="text-sm font-bold text-accent">
                      {t("breadcrumbQuest")}
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: Nickname */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {t("nickname")}
                    </h2>
                    <p className="text-text-muted text-sm">{t("nicknameDesc")}</p>
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t("enterNickname")}
                    className="w-full px-4 py-3 border-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg text-text"
                    autoFocus
                  />
                </div>
              )}

              {/* STEP 3: Goal */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {t("setupGoal")}
                    </h2>
                    <p className="text-text-muted text-sm">{t("setupGoalDesc")}</p>
                  </div>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder={t("goalPlaceholder")}
                    className="w-full px-4 py-3 border-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    autoFocus
                  />
                </div>
              )}

              {/* STEP 4: Project */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {t("setupProject")}
                    </h2>
                    <p className="text-text-muted text-sm">{t("setupProjectDesc")}</p>
                  </div>
                  {goalTitle.trim() && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                      <FiTarget size={14} className="text-primary-dark flex-shrink-0" />
                      <span className="text-sm text-primary-dark font-semibold truncate">
                        {goalTitle}
                      </span>
                    </div>
                  )}
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder={t("projectPlaceholder")}
                    className="w-full px-4 py-3 border-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    autoFocus
                  />
                </div>
              )}

              {/* STEP 5: Quest */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {t("setupQuest")}
                    </h2>
                    <p className="text-text-muted text-sm">{t("setupQuestDesc")}</p>
                  </div>

                  {/* Context: goal → project chain */}
                  {(goalTitle.trim() || projectTitle.trim()) && (
                    <div className="space-y-1">
                      {goalTitle.trim() && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                          <FiTarget size={12} className="text-primary-dark flex-shrink-0" />
                          <span className="text-xs text-primary-dark font-semibold truncate">
                            {goalTitle}
                          </span>
                        </div>
                      )}
                      {projectTitle.trim() && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/60 rounded-lg ml-3">
                          <FiFolder size={12} className="text-text-muted flex-shrink-0" />
                          <span className="text-xs text-text-muted font-semibold truncate">
                            {projectTitle}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Type selector */}
                  <div>
                    <p className="text-sm font-semibold text-text mb-2">
                      {t("questType")}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          value: "habit" as const,
                          label: t("questTypeHabit"),
                          desc: t("questTypeHabitDesc"),
                          Icon: FiRepeat,
                        },
                        {
                          value: "todo" as const,
                          label: t("questTypeTodo"),
                          desc: t("questTypeTodoDesc"),
                          Icon: FiCheckSquare,
                        },
                      ].map(({ value, label, desc, Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setQuestType(value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            questType === value
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background-surface"
                          }`}
                        >
                          <Icon
                            size={22}
                            className={
                              questType === value
                                ? "text-primary-dark"
                                : "text-text-muted"
                            }
                          />
                          <div className="text-center">
                            <p
                              className={`text-sm font-bold ${
                                questType === value
                                  ? "text-primary-dark"
                                  : "text-text"
                              }`}
                            >
                              {label}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={questTitle}
                    onChange={(e) => setQuestTitle(e.target.value)}
                    placeholder={t("questPlaceholder")}
                    className="w-full px-4 py-3 border-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  />
                </div>
              )}

              {/* STEP 6: Complete */}
              {step === 6 && (
                <div className="flex flex-col items-center text-center space-y-6 pt-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, delay: 0.1 }}
                    className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center"
                  >
                    <FiCheck size={36} className="text-primary-dark" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-2">
                      {nickname ? `${nickname}, ` : ""}
                      {t("complete")}
                    </h2>
                    <p className="text-text-muted">{t("completeDesc")}</p>
                  </div>

                  {/* Summary of created items */}
                  {(goalTitle.trim() || projectTitle.trim() || questTitle.trim()) && (
                    <div className="w-full space-y-2 text-left">
                      {goalTitle.trim() && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 rounded-xl"
                        >
                          <FiCheck size={14} className="text-primary-dark flex-shrink-0" />
                          <span className="text-sm text-primary-dark font-semibold truncate">
                            {goalTitle}
                          </span>
                        </motion.div>
                      )}
                      {projectTitle.trim() && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-secondary/60 rounded-xl ml-4"
                        >
                          <FiCheck size={14} className="text-text-muted flex-shrink-0" />
                          <span className="text-sm text-text-muted font-semibold truncate">
                            {projectTitle}
                          </span>
                        </motion.div>
                      )}
                      {questTitle.trim() && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 rounded-xl ml-8"
                        >
                          <FiCheck size={14} className="text-accent flex-shrink-0" />
                          <span className="text-sm text-accent font-semibold truncate">
                            {questTitle}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-6">
          <button
            onClick={handleNext}
            disabled={!canNext}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              canNext
                ? "bg-primary hover:bg-primary-dark"
                : "bg-border cursor-not-allowed text-text-muted"
            }`}
          >
            {isLastStep ? (
              <>
                <FiCheck size={20} />
                {t("start")}
              </>
            ) : (
              <>
                {tc("next")}
                <FiChevronRight size={20} />
              </>
            )}
          </button>

          {canSkip && (
            <button
              onClick={handleSkip}
              className="w-full py-3 text-text-muted hover:text-text font-semibold transition-colors"
            >
              {tc("skip")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
