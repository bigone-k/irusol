'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { useTaskStore } from '@/store/useTaskStore'
import { getTasksForDate } from '@/lib/calendar-utils'
import TaskCard from './TaskCard'

interface DateTaskSheetProps {
  date: Date
  isOpen: boolean
  onClose: () => void
}

function DateTaskSheet({ date, isOpen, onClose }: DateTaskSheetProps) {
  const locale = useLocale()
  const tasks = useTaskStore(state => state.tasks)

  const dayTasks = getTasksForDate(tasks, date)

  // 날짜 포맷팅
  const dateHeader = format(
    date,
    locale === 'ko' ? 'M월 d일 (EEE)' : 'MMM d, EEE',
    { locale: locale === 'ko' ? ko : undefined }
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background-surface rounded-t-2xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background-surface border-b border-border px-4 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text">{dateHeader}</h2>
                {dayTasks.length > 0 && (
                  <p className="text-sm text-text-muted mt-1">
                    {locale === 'ko' ? `${dayTasks.length}개의 작업` : `${dayTasks.length} tasks`}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-background rounded-lg transition-colors"
                aria-label="Close"
              >
                <FiX className="text-xl text-text" />
              </button>
            </div>

            {/* Tasks List */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              {dayTasks.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-text-muted">
                    {locale === 'ko' ? '할 일이 없어요' : 'No tasks for this day'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {dayTasks.map(task => (
                    <TaskCard key={task.id} task={task} date={date} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default memo(DateTaskSheet)
