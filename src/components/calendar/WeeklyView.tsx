'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { format, isToday, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useTaskStore } from '@/store/useTaskStore'
import { getWeekDays, formatWeekRange, getTasksForDate } from '@/lib/calendar-utils'
import TaskCard from './TaskCard'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function WeeklyView() {
  const locale = useLocale()
  const { currentDate, goToPreviousWeek, goToNextWeek, goToToday } = useCalendarStore()
  const tasks = useTaskStore(state => state.tasks)

  const weekDays = getWeekDays(currentDate)
  const weekRangeText = formatWeekRange(currentDate, locale)

  // 선택된 날짜 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // currentDate가 변경되면 선택된 날짜도 업데이트 (주가 바뀔 때)
  useEffect(() => {
    // 현재 주에 오늘이 포함되어 있으면 오늘로, 아니면 첫 번째 날짜로
    const todayInWeek = weekDays.find(day => isToday(day))
    if (todayInWeek) {
      setSelectedDate(todayInWeek)
    } else {
      setSelectedDate(weekDays[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate])

  const selectedDayTasks = getTasksForDate(tasks, selectedDate)

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-background-surface p-4 rounded-lg border border-border">
        <button
          onClick={goToPreviousWeek}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          aria-label="Previous week"
        >
          <FiChevronLeft className="text-xl text-text" />
        </button>

        <div className="text-center">
          <p className="text-sm text-text-muted">{weekRangeText}</p>
          <button
            onClick={goToToday}
            className="text-xs text-primary hover:underline mt-1"
          >
            {locale === 'ko' ? '오늘' : 'Today'}
          </button>
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          aria-label="Next week"
        >
          <FiChevronRight className="text-xl text-text" />
        </button>
      </div>

      {/* Week Days Selector */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dayNumber = format(day, 'd')
          const dayName = format(day, 'EEE', { locale: locale === 'ko' ? ko : undefined })
          const isCurrentDay = isToday(day)
          const isSelected = isSameDay(day, selectedDate)

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`
                flex flex-col items-center py-3 rounded-lg transition-all
                ${isSelected
                  ? 'bg-primary text-white shadow-md'
                  : isCurrentDay
                  ? 'bg-secondary/50 text-text border border-secondary'
                  : 'bg-background-surface text-text-muted hover:bg-border'
                }
              `}
            >
              <span className="text-xs mb-1">{dayName}</span>
              <span className={`text-lg font-bold ${isSelected ? 'text-white' : isCurrentDay ? 'text-text' : 'text-text'}`}>
                {dayNumber}
              </span>
            </button>
          )
        })}
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
