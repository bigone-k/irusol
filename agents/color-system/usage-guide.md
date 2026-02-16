# Color System Usage Guide

실전 사용 예시와 패턴 가이드입니다.

## 빠른 시작

### 1. 기본 컴포넌트 색상

```tsx
// 카드
<div className="bg-background-surface border rounded-xl p-4">
  <h3 className="text-text font-bold">제목</h3>
  <p className="text-text-muted">설명</p>
</div>

// 버튼
<button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
  클릭
</button>

// 배지
<span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
  새 기능
</span>
```

## 실전 컴포넌트 예시

### 1. 할 일 목록 (Task List)

```tsx
interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`
            bg-background-surface
            border-2
            rounded-xl
            p-4
            transition-all
            ${task.completed
              ? 'border-accent bg-accent/10'
              : 'border hover:border-primary'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              className="w-5 h-5 rounded text-accent focus:ring-primary"
            />
            <span className={
              task.completed
                ? 'text-text-muted line-through'
                : 'text-text font-medium'
            }>
              {task.title}
            </span>
          </div>

          {/* Priority Badge */}
          {task.priority === 'high' && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-secondary text-text text-xs rounded-full">
              ⚡ 긴급
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
```

### 2. 진행 상태 카드 (Progress Card)

```tsx
interface Goal {
  id: string
  title: string
  current: number
  target: number
  status: 'not-started' | 'in-progress' | 'completed'
}

export default function ProgressCard({ goal }: { goal: Goal }) {
  const progress = Math.round((goal.current / goal.target) * 100)

  const getStatusStyle = () => {
    switch (goal.status) {
      case 'completed':
        return 'border-accent bg-accent/10'
      case 'in-progress':
        return 'border-primary bg-primary/5'
      default:
        return 'border'
    }
  }

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-accent'
    if (progress >= 70) return 'bg-primary'
    if (progress >= 50) return 'bg-primary'
    return 'bg-track'
  }

  return (
    <div className={`bg-background-surface rounded-2xl p-5 border-2 ${getStatusStyle()}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-text">{goal.title}</h3>
        <p className="text-sm text-text-muted mt-1">
          {goal.current} / {goal.target}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-3 bg-track rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-1 text-right">
          {progress}%
        </p>
      </div>

      {/* Status Badge */}
      {goal.status === 'completed' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent/20 border border-accent rounded-lg">
          <span className="text-accent">✓</span>
          <span className="text-sm text-accent font-medium">
            목표 달성!
          </span>
        </div>
      )}
    </div>
  )
}
```

### 3. 통계 대시보드 (Stats Dashboard)

```tsx
interface Stat {
  label: string
  value: number
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
}

export default function StatsDashboard({ stats }: { stats: Stat[] }) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-accent'
      case 'down': return 'text-text-muted'
      default: return 'text-primary'
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-background-surface rounded-xl p-4 border hover:border-primary transition-all"
        >
          {/* Icon */}
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <div className="text-primary text-xl">
              {stat.icon}
            </div>
          </div>

          {/* Value */}
          <p className="text-3xl font-bold text-text mb-1">
            {stat.value}
          </p>

          {/* Label */}
          <p className="text-xs text-text-muted">
            {stat.label}
          </p>

          {/* Trend */}
          <div className={`flex items-center gap-1 mt-2 ${getTrendColor(stat.trend)}`}>
            {stat.trend === 'up' && '↑'}
            {stat.trend === 'down' && '↓'}
            {stat.trend === 'stable' && '→'}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 4. 폼 입력 (Form Inputs)

```tsx
export default function TaskForm() {
  return (
    <form className="space-y-4">
      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          제목
        </label>
        <input
          type="text"
          className="
            w-full
            px-4 py-2
            bg-background-surface
            border border-border
            rounded-lg
            text-text
            placeholder:text-text-muted
            focus:ring-2
            focus:ring-primary
            focus:border-primary
            transition-all
          "
          placeholder="할 일을 입력하세요"
        />
      </div>

      {/* Textarea */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          설명
        </label>
        <textarea
          rows={4}
          className="
            w-full
            px-4 py-2
            bg-background-surface
            border border-border
            rounded-lg
            text-text
            placeholder:text-text-muted
            focus:ring-2
            focus:ring-primary
            focus:border-primary
            transition-all
          "
          placeholder="상세 설명을 입력하세요"
        />
      </div>

      {/* Select */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          우선순위
        </label>
        <select
          className="
            w-full
            px-4 py-2
            bg-background-surface
            border border-border
            rounded-lg
            text-text
            focus:ring-2
            focus:ring-primary
            focus:border-primary
          "
        >
          <option>낮음</option>
          <option>보통</option>
          <option>높음</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="
            flex-1
            bg-primary
            hover:bg-primary-dark
            text-white
            font-medium
            py-3
            rounded-lg
            transition-colors
          "
        >
          저장
        </button>
        <button
          type="button"
          className="
            px-6
            bg-background-surface
            hover:bg-track
            text-text
            border
            font-medium
            py-3
            rounded-lg
            transition-colors
          "
        >
          취소
        </button>
      </div>
    </form>
  )
}
```

### 5. 알림 시스템 (Notification System)

```tsx
type NotificationType = 'success' | 'info' | 'warning' | 'error'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
}

export default function NotificationToast({ notification }: { notification: Notification }) {
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-accent',
          icon: '✓',
          iconBg: 'bg-white/20'
        }
      case 'info':
        return {
          bg: 'bg-primary',
          icon: 'ℹ',
          iconBg: 'bg-white/20'
        }
      case 'warning':
        return {
          bg: 'bg-secondary',
          icon: '⚠',
          iconBg: 'bg-white/20',
          textColor: 'text-text'
        }
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: '✕',
          iconBg: 'bg-white/20'
        }
    }
  }

  const style = getNotificationStyle()

  return (
    <div className={`
      ${style.bg}
      ${style.textColor || 'text-white'}
      rounded-lg
      shadow-lg
      p-4
      flex
      items-start
      gap-3
      min-w-[300px]
      max-w-md
    `}>
      {/* Icon */}
      <div className={`
        ${style.iconBg}
        w-8
        h-8
        rounded-full
        flex
        items-center
        justify-center
        flex-shrink-0
      `}>
        <span className="text-lg">{style.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className="font-semibold mb-1">{notification.title}</h4>
        <p className="text-sm opacity-90">{notification.message}</p>
      </div>

      {/* Close Button */}
      <button className="hover:bg-white/10 rounded p-1 transition-colors">
        ✕
      </button>
    </div>
  )
}
```

### 6. 탭 네비게이션 (Tab Navigation)

```tsx
interface Tab {
  id: string
  label: string
  count?: number
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
}) {
  return (
    <div className="border-b border-border">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-3
              font-medium
              border-b-2
              transition-all
              ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text hover:border-border'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`
                ml-2
                px-2 py-0.5
                rounded-full
                text-xs
                ${activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'bg-track text-text-muted'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### 7. 모달 (Modal)

```tsx
export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}: {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-text/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-background-surface rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Icon */}
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-primary">?</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-text text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-text-muted text-center mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="
              flex-1
              bg-background-surface
              hover:bg-track
              text-text
              border
              font-medium
              py-3
              rounded-lg
              transition-colors
            "
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="
              flex-1
              bg-primary
              hover:bg-primary-dark
              text-white
              font-medium
              py-3
              rounded-lg
              transition-colors
            "
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 자주 사용하는 패턴

### 1. 호버 효과

```tsx
// 카드 호버
<div className="
  bg-background-surface
  border
  hover:border-primary
  hover:shadow-md
  transition-all
  cursor-pointer
">

// 버튼 호버
<button className="
  bg-primary
  hover:bg-primary-dark
  hover:shadow-lg
  transition-all
">

// 링크 호버
<a className="
  text-primary
  hover:text-primary-dark
  hover:underline
  transition-colors
">
```

### 2. 포커스 스타일

```tsx
// 입력 필드
<input className="
  focus:ring-2
  focus:ring-primary
  focus:border-primary
  focus:outline-none
">

// 버튼
<button className="
  focus:ring-2
  focus:ring-primary
  focus:ring-offset-2
  focus:outline-none
">
```

### 3. 비활성 상태

```tsx
// 비활성 버튼
<button
  disabled
  className="
    bg-track
    text-text-muted
    cursor-not-allowed
    opacity-60
  "
>

// 비활성 입력
<input
  disabled
  className="
    bg-track
    text-text-muted
    cursor-not-allowed
  "
>
```

## 체크리스트

새 컴포넌트 생성 시:

- [ ] 레거시 색상 사용 안 함 (purple-*, blue-*, gray-* 등)
- [ ] 상태별 색상 올바르게 적용
- [ ] 호버/포커스 상태 정의
- [ ] 접근성 대비율 검증
- [ ] 반응형 디자인 고려

---

*Last Updated: 2026-02-15*
