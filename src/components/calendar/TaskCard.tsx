'use client'

import { memo } from 'react'
import { FiCheck } from 'react-icons/fi'
import { useLocale } from 'next-intl'
import { useTaskStore } from '@/store/useTaskStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { Task } from '@/types'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  date: Date
}

function TaskCard({ task, date }: TaskCardProps) {
  const locale = useLocale()
  const completeTask = useTaskStore(state => state.completeTask)
  const completeTaskXPOnly = usePlayerStore(state => state.completeTaskXPOnly)

  const dateKey = format(date, 'yyyy-MM-dd')
  const isCompleted = task.completedDates?.includes(dateKey) || false

  const handleToggle = () => {
    if (isCompleted) return // 이미 완료된 작업은 토글 안 함

    // 작업 완료 처리 (useTaskStore에서 completedDates 업데이트)
    completeTask(task.id)

    // XP만 획득 (코인 없음, 기본 난이도 'normal' 사용)
    completeTaskXPOnly(task.difficulty || 'normal')
  }

  return (
    <div className="px-4 py-3 hover:bg-background transition-colors">
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isCompleted}
          className={`
            flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center
            transition-colors
            ${isCompleted
              ? 'bg-accent border-accent cursor-default'
              : 'border-border hover:border-primary'
            }
          `}
          aria-label={isCompleted ? 'Completed' : 'Mark as complete'}
        >
          {isCompleted && <FiCheck className="text-white text-sm" />}
        </button>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Type Label */}
            <span
              className={`
                flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium text-white
                ${task.type === 'habit' ? 'bg-primary' : 'bg-accent'}
              `}
            >
              {task.type === 'habit'
                ? (locale === 'ko' ? '습관' : 'Habit')
                : (locale === 'ko' ? '할일' : 'Todo')
              }
            </span>
            <p className={`text-sm font-medium ${isCompleted ? 'text-text-muted line-through' : 'text-text'}`}>
              {task.title}
            </p>
          </div>
          {task.description && (
            <p className="text-xs text-text-muted mt-1 truncate">
              {task.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(TaskCard)
