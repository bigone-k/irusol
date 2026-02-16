import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isWithinInterval,
  parseISO
} from 'date-fns'
import type { Task } from '@/types'

/**
 * 주간 날짜 배열 생성 (월요일 시작)
 */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // 월요일 시작
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

/**
 * 특정 날짜에 해당하는 작업 필터링
 */
export function getTasksForDate(tasks: Task[], targetDate: Date): Task[] {
  return tasks.filter(task => {
    // To-do: 정확한 dueDate 매칭
    if (task.type === 'todo' && task.dueDate) {
      const dueDate = typeof task.dueDate === 'string'
        ? parseISO(task.dueDate)
        : task.dueDate
      return isSameDay(dueDate, targetDate)
    }

    // Habit: 기간 + 빈도 체크
    if (task.type === 'habit') {
      if (!task.startDate) return false

      const startDate = typeof task.startDate === 'string'
        ? parseISO(task.startDate)
        : task.startDate

      const endDate = task.endDate
        ? (typeof task.endDate === 'string' ? parseISO(task.endDate) : task.endDate)
        : null

      // 기간 체크
      const isInRange = endDate
        ? isWithinInterval(targetDate, { start: startDate, end: endDate })
        : targetDate >= startDate

      if (!isInRange) return false

      // 빈도 체크
      // frequency가 없으면 매일로 간주
      if (!task.frequency || task.frequency.length === 0) return true

      // frequency 배열에 해당 요일이 포함되는지 확인 (0=일, 1=월, ..., 6=토)
      const dayOfWeek = targetDate.getDay()
      return task.frequency.includes(dayOfWeek)
    }

    return false
  })
}

/**
 * 날짜 포맷팅 (한국어/영어 공통)
 */
export function formatDateHeader(date: Date, locale: string): string {
  if (locale === 'ko') {
    return format(date, 'M월 d일 (EEE)', { locale: require('date-fns/locale/ko').default })
  }
  return format(date, 'MMM d, EEE')
}

/**
 * 주간 범위 텍스트 (예: "2024년 1월 1주")
 */
export function formatWeekRange(date: Date, locale: string): string {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })

  if (locale === 'ko') {
    return `${format(start, 'M월 d일')} - ${format(end, 'd일')}`
  }
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
}
