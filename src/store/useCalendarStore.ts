import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addWeeks, subWeeks } from 'date-fns';

type ViewMode = 'week' | 'month';

interface CalendarStore {
  viewMode: ViewMode;
  currentDate: Date;

  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      viewMode: 'week', // 기본값: 주간 뷰
      currentDate: new Date(),

      setViewMode: (mode) => set({ viewMode: mode }),
      setCurrentDate: (date) => set({ currentDate: date }),

      goToPreviousWeek: () =>
        set((state) => ({
          currentDate: subWeeks(state.currentDate, 1),
        })),

      goToNextWeek: () =>
        set((state) => ({
          currentDate: addWeeks(state.currentDate, 1),
        })),

      goToPreviousMonth: () =>
        set((state) => ({
          currentDate: new Date(
            state.currentDate.getFullYear(),
            state.currentDate.getMonth() - 1,
            1
          ),
        })),

      goToNextMonth: () =>
        set((state) => ({
          currentDate: new Date(
            state.currentDate.getFullYear(),
            state.currentDate.getMonth() + 1,
            1
          ),
        })),

      goToToday: () => set({ currentDate: new Date() }),
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);
