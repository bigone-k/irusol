import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import type { Task } from "@/types";

export const getDaysRemaining = (endDate?: Date): number | null => {
  if (!endDate) return null;
  const today = new Date();
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatPeriod = (startDate?: Date, endDate?: Date): string | null => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  const end = new Date(endDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  return `${start} - ${end}`;
};

export const getFrequencyText = (task: Task): string | null => {
  if (!task.frequency || task.frequency.length === 0) return null;
  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  return task.frequency.map((d) => dayLabels[d]).join(", ");
};

export const getTotalScheduledDays = (task: Task): number => {
  if (!task.startDate || !task.endDate || !task.frequency || task.frequency.length === 0) return 0;
  const start = new Date(task.startDate);
  const end = new Date(task.endDate);
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (task.frequency.includes(cursor.getDay())) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
};

export const isTodoCompleted = (task: Task): boolean =>
  task.completed || ((task.completedDates?.length ?? 0) > 0);

export const getProgress = (task: Task): number => {
  if (task.type === "todo") return isTodoCompleted(task) ? 100 : 0;

  if (task.startDate && task.endDate && task.frequency && task.frequency.length > 0) {
    const totalDays = getTotalScheduledDays(task);
    if (totalDays === 0) return 0;
    const startStr = format(new Date(task.startDate), "yyyy-MM-dd");
    const endStr = format(new Date(task.endDate), "yyyy-MM-dd");
    const completedInRange = (task.completedDates || []).filter(
      (d) => d >= startStr && d <= endStr
    ).length;
    return Math.min(100, (completedInRange / totalDays) * 100);
  }

  if (task.targetDays) {
    return Math.min(100, ((task.completionCount || 0) / task.targetDays) * 100);
  }

  if (task.frequencyTarget && task.completedDates && task.frequencyPeriod) {
    const today = new Date();
    let periodStart: Date;
    let periodEnd: Date;
    if (task.frequencyPeriod === "weekly") {
      periodStart = startOfWeek(today, { weekStartsOn: 1 });
      periodEnd = endOfWeek(today, { weekStartsOn: 1 });
    } else if (task.frequencyPeriod === "monthly") {
      periodStart = startOfMonth(today);
      periodEnd = endOfMonth(today);
    } else {
      const todayStr = format(today, "yyyy-MM-dd");
      return task.completedDates.includes(todayStr) ? 100 : 0;
    }
    const periodStartStr = format(periodStart, "yyyy-MM-dd");
    const periodEndStr = format(periodEnd, "yyyy-MM-dd");
    const completions = task.completedDates.filter(
      (d) => d >= periodStartStr && d <= periodEndStr
    ).length;
    return Math.min(100, (completions / task.frequencyTarget) * 100);
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");
  return task.completedDates?.includes(todayStr) ? 100 : 0;
};

export const getProgressLabel = (task: Task): string | null => {
  if (task.type === "todo") return isTodoCompleted(task) ? "100%" : "0%";
  if ((task.startDate && task.endDate && task.frequency?.length) || task.targetDays) {
    return `${Math.floor(getProgress(task))}%`;
  }
  return null;
};
