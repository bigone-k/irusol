export interface OnboardingTemplate {
  key: "A" | "B" | "C" | "D";
  icon: string;
  categoryKey: string;
  goal: {
    titleKey: string;
    descKey: string;
    target: number;
    unit: string;
  };
  project: {
    titleKey: string;
    descKey: string;
  };
  todos: { titleKey: string; dayOffset: number }[];
  habits: {
    titleKey: string;
    frequency?: number[];
    frequencyTarget?: number;
    frequencyPeriod?: "daily" | "weekly" | "monthly";
  }[];
}

export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  // A — 건강 (2kg 감량)
  {
    key: "A",
    icon: "💪",
    categoryKey: "templateHealthCategory",
    goal: {
      titleKey: "templateAGoal",
      descKey: "templateAGoalDesc",
      target: 2,
      unit: "kg",
    },
    project: {
      titleKey: "templateAProject",
      descKey: "templateAProjectDesc",
    },
    todos: [
      { titleKey: "templateATodo1", dayOffset: 0 },
      { titleKey: "templateATodo2", dayOffset: 1 },
      { titleKey: "templateATodo3", dayOffset: 2 },
    ],
    habits: [
      { titleKey: "templateAHabit1", frequency: [1, 3, 5] },
    ],
  },
  // B — 마음건강 (취향리스트)
  {
    key: "B",
    icon: "💜",
    categoryKey: "templateMindCategory",
    goal: {
      titleKey: "templateBGoal",
      descKey: "templateBGoalDesc",
      target: 10,
      unit: "회",
    },
    project: {
      titleKey: "templateBProject",
      descKey: "templateBProjectDesc",
    },
    todos: [
      { titleKey: "templateBTodo1", dayOffset: 0 },
      { titleKey: "templateBTodo2", dayOffset: 1 },
      { titleKey: "templateBTodo3", dayOffset: 3 },
      { titleKey: "templateBTodo4", dayOffset: 4 },
      { titleKey: "templateBTodo5", dayOffset: 5 },
      { titleKey: "templateBTodo6", dayOffset: 16 },
      { titleKey: "templateBTodo7", dayOffset: 25 },
      { titleKey: "templateBTodo8", dayOffset: 27 },
    ],
    habits: [],
  },
  // C — 독서 (3권 완독)
  {
    key: "C",
    icon: "📚",
    categoryKey: "templateReadingCategory",
    goal: {
      titleKey: "templateCGoal",
      descKey: "templateCGoalDesc",
      target: 3,
      unit: "권",
    },
    project: {
      titleKey: "templateCProject",
      descKey: "templateCProjectDesc",
    },
    todos: [
      { titleKey: "templateCTodo1", dayOffset: 0 },
      { titleKey: "templateCTodo2", dayOffset: 0 },
      { titleKey: "templateCTodo3", dayOffset: 25 },
      { titleKey: "templateCTodo4", dayOffset: 27 },
    ],
    habits: [
      { titleKey: "templateCHabit1", frequency: [1, 2, 3, 4], frequencyTarget: 4, frequencyPeriod: "weekly" },
    ],
  },
  // D — 생활 (집밥 레시피)
  {
    key: "D",
    icon: "🍳",
    categoryKey: "templateLifeCategory",
    goal: {
      titleKey: "templateDGoal",
      descKey: "templateDGoalDesc",
      target: 10,
      unit: "개",
    },
    project: {
      titleKey: "templateDProject",
      descKey: "templateDProjectDesc",
    },
    todos: [
      { titleKey: "templateDTodo1", dayOffset: 0 },
      { titleKey: "templateDTodo2", dayOffset: 3 },
      { titleKey: "templateDTodo3", dayOffset: 7 },
    ],
    habits: [
      { titleKey: "templateDHabit1", frequency: [1, 5], frequencyTarget: 2, frequencyPeriod: "weekly" },
    ],
  },
];
