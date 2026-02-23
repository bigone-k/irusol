'use client'

import { memo, useState, useRef } from 'react'
import { FiCheck } from 'react-icons/fi'
import { useLocale } from 'next-intl'
import { useTaskStore } from '@/store/useTaskStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { Task } from '@/types'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { TASK_EXP } from '@/lib/rewards'

interface TaskCardProps {
  task: Task
  date: Date
}

function TaskCard({ task, date }: TaskCardProps) {
  const locale = useLocale()
  const completeTask = useTaskStore(state => state.completeTask)
  const uncompleteTask = useTaskStore(state => state.uncompleteTask)
  const completeTaskXPOnly = usePlayerStore(state => state.completeTaskXPOnly)
  const loseExperience = usePlayerStore(state => state.loseExperience)

  const [xpNote, setXpNote] = useState<{ type: 'gain' | 'lose'; id: number } | null>(null)
  const noteId = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dateKey = format(date, 'yyyy-MM-dd')
  const isCompleted = task.completedDates?.includes(dateKey) || false

  const showXpNote = (type: 'gain' | 'lose') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    noteId.current += 1
    setXpNote({ type, id: noteId.current })
    timerRef.current = setTimeout(() => setXpNote(null), 2000)
  }

  const handleToggle = () => {
    if (isCompleted) {
      uncompleteTask(task.id, dateKey)
      loseExperience(TASK_EXP)
      showXpNote('lose')
    } else {
      completeTask(task.id, dateKey)
      completeTaskXPOnly()
      showXpNote('gain')
    }
  }

  return (
    <div className="px-4 py-3 hover:bg-background transition-colors">
      <div className="flex items-center gap-3">
        {/* Checkbox with XP badge */}
        <div className="relative flex-shrink-0">
          <button
            onClick={handleToggle}
            className={`
              w-6 h-6 rounded-md border-2 flex items-center justify-center
              transition-colors
              ${isCompleted
                ? 'bg-accent border-accent hover:bg-accent/80 hover:border-accent/80'
                : 'border-border hover:border-primary'
              }
            `}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && <FiCheck className="text-white text-sm" />}
          </button>

          {/* XP 획득/손실 알림 배지 */}
          <AnimatePresence>
            {xpNote && (
              <motion.span
                key={xpNote.id}
                initial={{ opacity: 1, y: 0, x: '-50%' }}
                animate={{ opacity: 0, y: -32, x: '-50%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                className={`
                  absolute -top-1 left-1/2 text-xs font-bold whitespace-nowrap
                  pointer-events-none z-20 drop-shadow-sm
                  ${xpNote.type === 'gain' ? 'text-primary-dark' : 'text-red-400'}
                `}
              >
                {xpNote.type === 'gain' ? `+${TASK_EXP} XP` : `-${TASK_EXP} XP`}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

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
