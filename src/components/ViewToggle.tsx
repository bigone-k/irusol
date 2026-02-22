'use client'

import { memo } from 'react'
import { useTranslations } from 'next-intl'
import { useCalendarStore } from '@/store/useCalendarStore'
import { FiCalendar, FiGrid } from 'react-icons/fi'

function ViewToggle() {
  const t = useTranslations('calendar')
  const { viewMode, setViewMode } = useCalendarStore()

  const handleToggle = () => {
    setViewMode(viewMode === 'week' ? 'month' : 'week')
  }

  return (
    <button
      onClick={handleToggle}
      className="fixed bottom-24 left-4 z-40 bg-primary text-white rounded-full p-4 hover:bg-primary-dark transition-all duration-200 hover:scale-110"
      aria-label={viewMode === 'week' ? t('monthView') : t('weekView')}
    >
      {viewMode === 'week' ? (
        <FiGrid className="text-2xl" />
      ) : (
        <FiCalendar className="text-2xl" />
      )}
    </button>
  )
}

export default memo(ViewToggle)
