'use client'

import { memo } from 'react'
import { format, isToday } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getTasksForDate } from '@/lib/calendar-utils'
import type { Task } from '@/types'
import TaskCard from './TaskCard'

interface DaySectionProps {
  date: Date
  tasks: Task[]
  locale: string
}

function DaySection({ date, tasks, locale }: DaySectionProps) {
  const dayTasks = getTasksForDate(tasks, date)
  const isCurrentDay = isToday(date)

  // 날짜 헤더 포맷
  const dayNumber = format(date, 'd')
  const dayName = format(date, 'EEE', { locale: locale === 'ko' ? ko : undefined })

  return (
    <div
      className={`
        bg-background-surface border rounded-lg overflow-hidden
        ${isCurrentDay ? 'border-primary shadow-md' : 'border-border'}
      `}
    >
      {/* Date Header */}
      <div
        className={`
          px-4 py-2 border-b flex items-center gap-2
          ${isCurrentDay ? 'bg-primary/10 border-primary/20' : 'bg-background border-border'}
        `}
      >
        <span className={`text-lg font-bold ${isCurrentDay ? 'text-primary' : 'text-text'}`}>
          {dayNumber}
        </span>
        <span className="text-sm text-text-muted">{dayName}</span>
        {dayTasks.length > 0 && (
          <span className="ml-auto text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
            {dayTasks.length}
          </span>
        )}
      </div>

      {/* Tasks List */}
      <div className="divide-y divide-border">
        {dayTasks.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-text-muted">
            {locale === 'ko' ? '할 일이 없어요' : 'No tasks for this day'}
          </div>
        ) : (
          dayTasks.map(task => (
            <TaskCard key={task.id} task={task} date={date} />
          ))
        )}
      </div>
    </div>
  )
}

export default memo(DaySection)
