"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useVisionStore } from "@/store/useVisionStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiEye,
  FiTarget,
  FiFolder,
  FiZap,
  FiRepeat,
  FiCheckSquare,
} from "react-icons/fi";
import Image from "next/image";
import LoadingModal from "./LoadingModal";
import {
  ONBOARDING_TEMPLATES,
  type OnboardingTemplate,
} from "@/lib/onboardingTemplates";
import { syncAllStoresInOrder } from "@/lib/supabase/sync";

// Steps: 0=Welcome, 1=Structure, 2=Vision, 3=TemplateSelection, 4=Goal, 5=Project, 6=Quest, 7=Complete
const TOTAL_STEPS = 8;
const BREADCRUMB_STEP_OFFSET = 4; // steps 4-6: Goal, Project, Quest

const DAY_NAMES_KEYS = [
  "habitDaySun",
  "habitDayMon",
  "habitDayTue",
  "habitDayWed",
  "habitDayThu",
  "habitDayFri",
  "habitDaySat",
] as const;

export default function Onboarding() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");

  const [step, setStep] = useState(0);
  const [visionTitle, setVisionTitle] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [questTitle, setQuestTitle] = useState("");
  const [questType, setQuestType] = useState<"habit" | "todo">("habit");

  const [isCompleting, setIsCompleting] = useState(false);

  // New state for template flow
  const [selectedTemplate, setSelectedTemplate] = useState<
    "A" | "B" | "C" | "D" | null
  >(null);
  const [path, setPath] = useState<"template" | "manual" | null>(null);

  const router = useRouter();
  const locale = useLocale();

  const { completeOnboarding } = useOnboardingStore();
  const setVision = useVisionStore((state) => state.setVision);
  const resetVision = useVisionStore((state) => state.reset);
  const addGoal = useGoalStore((state) => state.addGoal);
  const resetGoals = useGoalStore((state) => state.reset);
  const addProject = useProjectStore((state) => state.addProject);
  const resetProjects = useProjectStore((state) => state.reset);
  const addTask = useTaskStore((state) => state.addTask);
  const resetTasks = useTaskStore((state) => state.reset);

  const applyTemplate = (templateKey: "A" | "B" | "C" | "D") => {
    const tmpl = ONBOARDING_TEMPLATES.find((t) => t.key === templateKey);
    if (!tmpl) return;

    const now = new Date();
    const threeMonthsLater = new Date(now);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    // Create Goal
    addGoal({
      title: t(tmpl.goal.titleKey),
      description: t(tmpl.goal.descKey),
      targetValue: tmpl.goal.target,
      unit: tmpl.goal.unit,
      currentValue: 0,
    });
    const goalId = useGoalStore.getState().goals.slice(-1)[0]?.id;

    // Create Project
    addProject({
      goalId: goalId ?? "",
      title: t(tmpl.project.titleKey),
      description: t(tmpl.project.descKey),
    });
    const projectId = useProjectStore.getState().projects.slice(-1)[0]?.id;

    // Create Todos
    for (const todo of tmpl.todos) {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + todo.dayOffset);
      addTask({
        title: t(todo.titleKey),
        description: "",
        type: "todo",
        goalId,
        projectId,
        dueDate,
      });
    }

    // Create Habits
    for (const habit of tmpl.habits) {
      addTask({
        title: t(habit.titleKey),
        description: "",
        type: "habit",
        goalId,
        projectId,
        frequency: habit.frequency,
        frequencyTarget: habit.frequencyTarget,
        frequencyPeriod: habit.frequencyPeriod,
        startDate: now,
        endDate: threeMonthsLater,
      });
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      // 기존 데이터 초기화 (이전 테스트/세션 데이터 제거)
      resetVision();
      resetGoals();
      resetProjects();
      resetTasks();

      // Vision — both paths
      if (visionTitle.trim()) {
        setVision({ title: visionTitle.trim() });
      }

      if (path === "template" && selectedTemplate) {
        applyTemplate(selectedTemplate);
      } else {
        // Manual path — existing logic
        let goalId: string | undefined;
        if (goalTitle.trim()) {
          addGoal({ title: goalTitle.trim(), description: "" });
          goalId = useGoalStore.getState().goals.slice(-1)[0]?.id;
        }

        let projectId: string | undefined;
        if (projectTitle.trim()) {
          addProject({
            goalId: goalId ?? "",
            title: projectTitle.trim(),
            description: "",
          });
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
      }

      // FK 순서 보장: Vision → Goals → Projects → Tasks 순차 sync
      await syncAllStoresInOrder({
        vision: useVisionStore.getState().vision,
        goals: useGoalStore.getState().goals,
        projects: useProjectStore.getState().projects,
        tasks: useTaskStore.getState().tasks,
      });

      await completeOnboarding();
      router.push(`/${locale}/goals`);
    } finally {
      setIsCompleting(false);
    }
  };

  // Per-step canNext
  const canNext = [
    true, // 0: Welcome
    true, // 1: Structure
    true, // 2: Vision (optional)
    selectedTemplate !== null, // 3: Template selection (must select)
    true, // 4: Goal (optional)
    true, // 5: Project (optional)
    true, // 6: Quest (optional)
    true, // 7: Complete
  ][step];

  const canSkip = [false, false, true, false, true, true, true, false][step];
  const isLastStep = step === TOTAL_STEPS - 1;

  // Breadcrumb: steps 4-6 → indices 0-2 (Goal, Project, Quest)
  const breadcrumbActive =
    path === "manual" &&
    step >= BREADCRUMB_STEP_OFFSET &&
    step <= BREADCRUMB_STEP_OFFSET + 2
      ? step - BREADCRUMB_STEP_OFFSET
      : null;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else if (step === 3 && path === "template" && selectedTemplate) {
      setStep(7); // Jump to Complete
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    if (isLastStep) handleComplete();
    else setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) return;
    // From Complete back to Template Selection (template path)
    if (step === 7 && path === "template") {
      setStep(3);
      return;
    }
    setStep((s) => s - 1);
  };

  const handleSelectTemplate = (key: "A" | "B" | "C" | "D") => {
    setSelectedTemplate(key);
    setPath("template");
  };

  const handleManualInput = () => {
    setSelectedTemplate(null);
    setPath("manual");
    setStep(4);
  };

  const breadcrumbItems = [
    { label: t("breadcrumbGoal"), Icon: FiTarget },
    { label: t("breadcrumbProject"), Icon: FiFolder },
    { label: t("breadcrumbQuest"), Icon: FiZap },
  ];

  // Helper: get frequency description for habit
  const getHabitFrequencyLabel = (habit: OnboardingTemplate["habits"][0]) => {
    if (habit.frequency) {
      const dayNames = habit.frequency.map((d) => t(DAY_NAMES_KEYS[d]));
      return `${t("habitFrequencyWeekly", { count: habit.frequency.length })} (${dayNames.join("/")})`;
    }
    if (habit.frequencyTarget && habit.frequencyPeriod === "weekly") {
      return t("habitFrequencyWeekly", { count: habit.frequencyTarget });
    }
    return "";
  };

  // Helper: get quest count summary for template card
  const getQuestCountLabel = (tmpl: OnboardingTemplate) => {
    const todoCount = tmpl.todos.length;
    const habitCount = tmpl.habits.length;
    if (habitCount > 0) {
      return t("templateQuestCount", { todoCount, habitCount });
    }
    return t("templateQuestCountTodoOnly", { todoCount });
  };

  // Selected template data (for Complete summary)
  const selectedTmpl = selectedTemplate
    ? ONBOARDING_TEMPLATES.find((t) => t.key === selectedTemplate)
    : null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <LoadingModal isOpen={isCompleting} />
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
              {/* Breadcrumb — manual path steps 4-6 */}
              {breadcrumbActive !== null && (
                <div className="flex items-center justify-center gap-1 mb-6 flex-wrap">
                  {breadcrumbItems.map(({ label, Icon }, i) => (
                    <div key={i} className="flex items-center">
                      {i > 0 && (
                        <div
                          className={`w-4 h-0.5 ${
                            i <= breadcrumbActive ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                          i === breadcrumbActive
                            ? "bg-primary text-white shadow-sm"
                            : i < breadcrumbActive
                            ? "bg-primary/15 text-primary-dark"
                            : "bg-track text-text-muted"
                        }`}
                      >
                        <Icon size={10} />
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
                        Icon: FiEye,
                        bg: "bg-accent/10 border-accent/20",
                        iconColor: "text-accent",
                        label: t("breadcrumbVision"),
                        desc: t("structureVisionDesc"),
                        num: "1",
                      },
                      {
                        Icon: FiTarget,
                        bg: "bg-primary/10 border-primary/20",
                        iconColor: "text-primary-dark",
                        label: t("breadcrumbGoal"),
                        desc: t("structureGoalDesc"),
                        num: "2",
                      },
                      {
                        Icon: FiFolder,
                        bg: "bg-secondary/80 border-secondary-dark/20",
                        iconColor: "text-text",
                        label: t("breadcrumbProject"),
                        desc: t("structureProjectDesc"),
                        num: "3",
                      },
                      {
                        Icon: FiZap,
                        bg: "bg-primary/5 border-border",
                        iconColor: "text-text-muted",
                        label: t("breadcrumbQuest"),
                        desc: t("structureQuestDesc"),
                        num: "4",
                      },
                    ].map(({ Icon, bg, iconColor, label, desc, num }, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-4 p-3.5 rounded-xl border-2 ${bg}`}
                      >
                        <div className="w-9 h-9 rounded-full bg-background-surface flex items-center justify-center shadow-sm flex-shrink-0">
                          <Icon size={16} className={iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-text-muted opacity-40">
                              {num}
                            </span>
                            <p className="font-bold text-sm text-text">{label}</p>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
                    {[
                      t("breadcrumbVision"),
                      t("breadcrumbGoal"),
                      t("breadcrumbProject"),
                      t("breadcrumbQuest"),
                    ].map((label, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        {i > 0 && (
                          <FiChevronRight size={12} className="text-text-muted" />
                        )}
                        <span className="text-sm font-bold text-text-muted">
                          {label}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Vision */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {t("setupVision")}
                    </h2>
                    <p className="text-text-muted text-sm">{t("setupVisionDesc")}</p>
                  </div>
                  <input
                    type="text"
                    value={visionTitle}
                    onChange={(e) => setVisionTitle(e.target.value)}
                    placeholder={t("visionPlaceholder")}
                    className="w-full px-4 py-3 border-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    autoFocus
                  />
                </div>
              )}

              {/* STEP 3: Template Selection (NEW) */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {t("templateSelection")}
                    </h2>
                    <p className="text-text-muted text-sm">
                      {t("templateSelectionDesc")}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {ONBOARDING_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.key}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl.key)}
                        className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                          selectedTemplate === tmpl.key
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background-surface"
                        }`}
                      >
                        <span className="text-2xl">{tmpl.icon}</span>
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              selectedTemplate === tmpl.key
                                ? "text-primary-dark"
                                : "text-text"
                            }`}
                          >
                            {t(tmpl.categoryKey)}
                          </p>
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">
                            {t(tmpl.goal.titleKey)}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {tmpl.goal.target}
                            {tmpl.goal.unit}
                          </p>
                          <p className="text-[10px] text-text-muted/70 mt-1">
                            {getQuestCountLabel(tmpl)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Manual input button */}
                  <button
                    type="button"
                    onClick={handleManualInput}
                    className="w-full py-3 text-text-muted hover:text-text font-semibold transition-colors text-sm"
                  >
                    {t("manualInput")}
                  </button>
                </div>
              )}

              {/* STEP 4: Goal */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {t("setupGoal")}
                    </h2>
                    <p className="text-text-muted text-sm">{t("setupGoalDesc")}</p>
                  </div>
                  {visionTitle.trim() && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg">
                      <FiEye size={13} className="text-accent flex-shrink-0" />
                      <span className="text-sm text-accent font-semibold truncate">
                        {visionTitle}
                      </span>
                    </div>
                  )}
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

              {/* STEP 5: Project */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {t("setupProject")}
                    </h2>
                    <p className="text-text-muted text-sm">{t("setupProjectDesc")}</p>
                  </div>
                  {/* Context chain */}
                  <div className="space-y-1">
                    {visionTitle.trim() && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg">
                        <FiEye size={12} className="text-accent flex-shrink-0" />
                        <span className="text-xs text-accent font-semibold truncate">
                          {visionTitle}
                        </span>
                      </div>
                    )}
                    {goalTitle.trim() && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg ml-3">
                        <FiTarget size={12} className="text-primary-dark flex-shrink-0" />
                        <span className="text-xs text-primary-dark font-semibold truncate">
                          {goalTitle}
                        </span>
                      </div>
                    )}
                  </div>
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

              {/* STEP 6: Quest */}
              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {t("setupQuest")}
                    </h2>
                    <p className="text-text-muted text-sm">{t("setupQuestDesc")}</p>
                  </div>

                  {/* Context chain */}
                  {(visionTitle.trim() || goalTitle.trim() || projectTitle.trim()) && (
                    <div className="space-y-1">
                      {visionTitle.trim() && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg">
                          <FiEye size={12} className="text-accent flex-shrink-0" />
                          <span className="text-xs text-accent font-semibold truncate">
                            {visionTitle}
                          </span>
                        </div>
                      )}
                      {goalTitle.trim() && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg ml-3">
                          <FiTarget size={12} className="text-primary-dark flex-shrink-0" />
                          <span className="text-xs text-primary-dark font-semibold truncate">
                            {goalTitle}
                          </span>
                        </div>
                      )}
                      {projectTitle.trim() && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/60 rounded-lg ml-6">
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
                              questType === value ? "text-primary-dark" : "text-text-muted"
                            }
                          />
                          <div className="text-center">
                            <p
                              className={`text-sm font-bold ${
                                questType === value ? "text-primary-dark" : "text-text"
                              }`}
                            >
                              {label}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{desc}</p>
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

              {/* STEP 7: Complete */}
              {step === 7 && (
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
                      {t("complete")}
                    </h2>
                    <p className="text-text-muted">{t("completeDesc")}</p>
                  </div>

                  {/* Template path summary */}
                  {path === "template" && selectedTmpl && (
                    <div className="w-full space-y-2 text-left">
                      {/* Vision */}
                      {visionTitle.trim() && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 rounded-xl"
                        >
                          <FiEye size={13} className="text-accent flex-shrink-0" />
                          <span className="text-sm text-accent font-semibold truncate">
                            {visionTitle}
                          </span>
                        </motion.div>
                      )}
                      {/* Goal */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 rounded-xl ml-4"
                      >
                        <FiTarget size={13} className="text-primary-dark flex-shrink-0" />
                        <span className="text-sm text-primary-dark font-semibold truncate">
                          {t(selectedTmpl.goal.titleKey)}
                        </span>
                      </motion.div>
                      {/* Project */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary/60 rounded-xl ml-8"
                      >
                        <FiFolder size={13} className="text-text-muted flex-shrink-0" />
                        <span className="text-sm text-text-muted font-semibold truncate">
                          {t(selectedTmpl.project.titleKey)}
                        </span>
                      </motion.div>
                      {/* Quests (todos + habits with period info) */}
                      {selectedTmpl.todos.map((todo, i) => (
                        <motion.div
                          key={`todo-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.05 }}
                          className="flex items-center gap-2 px-4 py-2 bg-track rounded-xl ml-12"
                        >
                          <FiCheckSquare size={12} className="text-text-muted flex-shrink-0" />
                          <span className="text-xs text-text-muted font-medium truncate flex-1">
                            {t(todo.titleKey)}
                          </span>
                          <span className="text-[10px] text-text-muted/60 bg-background px-1.5 py-0.5 rounded flex-shrink-0">
                            {t("todoDueDay", { days: todo.dayOffset })}
                          </span>
                        </motion.div>
                      ))}
                      {selectedTmpl.habits.map((habit, i) => (
                        <motion.div
                          key={`habit-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.35 + selectedTmpl.todos.length * 0.05 + i * 0.05,
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-track rounded-xl ml-12"
                        >
                          <FiRepeat size={12} className="text-text-muted flex-shrink-0" />
                          <span className="text-xs text-text-muted font-medium truncate flex-1">
                            {t(habit.titleKey)}
                          </span>
                          <span className="text-[10px] text-text-muted/60 bg-background px-1.5 py-0.5 rounded flex-shrink-0">
                            {getHabitFrequencyLabel(habit)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Manual path summary */}
                  {path !== "template" &&
                    (visionTitle.trim() ||
                      goalTitle.trim() ||
                      projectTitle.trim() ||
                      questTitle.trim()) && (
                      <div className="w-full space-y-2 text-left">
                        {visionTitle.trim() && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 rounded-xl"
                          >
                            <FiEye size={13} className="text-accent flex-shrink-0" />
                            <span className="text-sm text-accent font-semibold truncate">
                              {visionTitle}
                            </span>
                          </motion.div>
                        )}
                        {goalTitle.trim() && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 rounded-xl ml-4"
                          >
                            <FiTarget size={13} className="text-primary-dark flex-shrink-0" />
                            <span className="text-sm text-primary-dark font-semibold truncate">
                              {goalTitle}
                            </span>
                          </motion.div>
                        )}
                        {projectTitle.trim() && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-secondary/60 rounded-xl ml-8"
                          >
                            <FiFolder size={13} className="text-text-muted flex-shrink-0" />
                            <span className="text-sm text-text-muted font-semibold truncate">
                              {projectTitle}
                            </span>
                          </motion.div>
                        )}
                        {questTitle.trim() && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-track rounded-xl ml-12"
                          >
                            <FiZap size={13} className="text-text-muted flex-shrink-0" />
                            <span className="text-sm text-text-muted font-semibold truncate">
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

          {step > 0 && (
            <button
              onClick={handleBack}
              className="w-full py-2 text-text-muted hover:text-text font-medium transition-colors flex items-center justify-center gap-1 text-sm"
            >
              <FiChevronLeft size={16} />
              {tc("back")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
