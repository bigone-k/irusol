'use client'

import { useCalendarStore } from '@/store/useCalendarStore'
import ViewToggle from '@/components/ViewToggle'
import WeeklyView from '@/components/calendar/WeeklyView'
import MonthlyView from '@/components/calendar/MonthlyView'

export default function CalendarPage() {
  const { viewMode } = useCalendarStore()

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Content */}
      <div className="px-4 py-4">
        {viewMode === 'week' ? (
          <WeeklyView />
        ) : (
          <MonthlyView />
        )}
      </div>

      {/* Floating Toggle Button */}
      <ViewToggle />
    </div>
  )
}
