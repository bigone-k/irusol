'use client'

import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/react-calendar.css'
import { useLocale } from 'next-intl'
import { format, isToday } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useTaskStore } from '@/store/useTaskStore'
import { getTasksForDate } from '@/lib/calendar-utils'
import TaskCard from './TaskCard'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

export default function MonthlyView() {
  const locale = useLocale()
  const { currentDate, setCurrentDate } = useCalendarStore()
  const tasks = useTaskStore(state => state.tasks)

  // 선택된 날짜 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const selectedDayTasks = getTasksForDate(tasks, selectedDate)

  // 특정 날짜에 작업 타입별 점 표시
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const tasksForDate = getTasksForDate(tasks, date)
    if (tasksForDate.length === 0) return null

    const hasHabit = tasksForDate.some(task => task.type === 'habit')
    const hasTodo = tasksForDate.some(task => task.type === 'todo')

    return (
      <div className="flex gap-1 justify-center mt-1">
        {hasHabit && (
          <div className="w-1 h-1 rounded-full bg-primary" />
        )}
        {hasTodo && (
          <div className="w-1 h-1 rounded-full bg-accent" />
        )}
      </div>
    )
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value)
    }
  }

  // 월 변경 핸들러
  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setCurrentDate(activeStartDate)
    }
  }

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="bg-background-surface rounded-lg border border-border p-4">
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          onActiveStartDateChange={handleActiveStartDateChange}
          locale={locale}
          tileContent={tileContent}
          formatShortWeekday={(locale, date) =>
            format(date, 'EEEEE', { locale: locale === 'ko' ? ko : undefined })
          }
          showNeighboringMonth={true}
          prev2Label={null}
          next2Label={null}
        />
      </div>

      {/* Selected Date Tasks */}
      <div className="bg-background-surface border border-border rounded-lg overflow-hidden">
        {/* Date Header */}
        <div className="px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text">
              {format(selectedDate, locale === 'ko' ? 'M월 d일 (EEE)' : 'MMM d, EEE', {
                locale: locale === 'ko' ? ko : undefined
              })}
              {isToday(selectedDate) && (
                <span className="ml-2 text-xs text-primary">
                  {locale === 'ko' ? '오늘' : 'Today'}
                </span>
              )}
            </h3>
            {selectedDayTasks.length > 0 && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                {selectedDayTasks.length}
              </span>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="divide-y divide-border">
          {selectedDayTasks.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-muted">
              {locale === 'ko' ? '퀘스트가 없어요' : 'No quests for this day'}
            </div>
          ) : (
            selectedDayTasks.map(task => (
              <TaskCard key={task.id} task={task} date={selectedDate} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
