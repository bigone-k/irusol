'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useVisionStore } from '@/store/useVisionStore'
import { useGoalStore } from '@/store/useGoalStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useTaskStore } from '@/store/useTaskStore'
import { fetchAllData, syncAllStoresInOrder } from '@/lib/supabase/sync'
import LoadingModal from './LoadingModal'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasSynced, setHasSynced] = useState(false)

  useEffect(() => {
    const unsubscribe = init()
    return unsubscribe
  }, [init])

  // Supabase ↔ 로컬 양방향 동기화
  useEffect(() => {
    if (!isAuthenticated || hasSynced) return

    let cancelled = false

    const syncData = async () => {
      setIsSyncing(true)
      try {
        // 1. DB에서 현재 데이터 fetch
        const remote = await fetchAllData()
        if (cancelled) return

        // 2. 로컬 store 현재 상태
        const localVision = useVisionStore.getState().vision
        const localGoals = useGoalStore.getState().goals
        const localProjects = useProjectStore.getState().projects
        const localTasks = useTaskStore.getState().tasks

        // 3. DB → 로컬: DB에 있는 데이터로 로컬 hydrate
        const dbHasData =
          remote.vision || remote.goals.length > 0 ||
          remote.projects.length > 0 || remote.tasks.length > 0

        if (dbHasData) {
          // DB 데이터를 기준으로 로컬에 merge
          const remoteGoalIds = new Set(remote.goals.map((g) => g.id))
          const remoteProjectIds = new Set(remote.projects.map((p) => p.id))
          const remoteTaskIds = new Set(remote.tasks.map((t) => t.id))

          // 로컬에만 있는 항목 추출 (이전 sync 실패분)
          const missingGoals = localGoals.filter((g) => !remoteGoalIds.has(g.id))
          const missingProjects = localProjects.filter((p) => !remoteProjectIds.has(p.id))
          const missingTasks = localTasks.filter((t) => !remoteTaskIds.has(t.id))
          const missingVision = localVision && !remote.vision ? localVision : null

          // DB 데이터 + 로컬 누락분 합쳐서 hydrate
          useVisionStore.getState().hydrate(remote.vision || localVision)
          useGoalStore.getState().hydrate([...remote.goals, ...missingGoals])
          useProjectStore.getState().hydrate([...remote.projects, ...missingProjects])
          useTaskStore.getState().hydrate([...remote.tasks, ...missingTasks])

          // 4. 로컬 → DB: 누락분을 백그라운드로 push (FK 순서 보장)
          if (missingVision || missingGoals.length > 0 || missingProjects.length > 0 || missingTasks.length > 0) {
            syncAllStoresInOrder({
              vision: missingVision,
              goals: missingGoals,
              projects: missingProjects,
              tasks: missingTasks,
            }).catch(() => {})
          }
        } else {
          // DB가 비어있고 로컬에 데이터가 있으면 → DB로 push
          const localHasData =
            localVision || localGoals.length > 0 ||
            localProjects.length > 0 || localTasks.length > 0

          if (localHasData) {
            syncAllStoresInOrder({
              vision: localVision,
              goals: localGoals,
              projects: localProjects,
              tasks: localTasks,
            }).catch(() => {})
          }
        }
      } catch {
        // Supabase fetch 실패 → localStorage 데이터 유지
      } finally {
        if (!cancelled) {
          setIsSyncing(false)
          setHasSynced(true)
        }
      }
    }

    syncData()
    return () => { cancelled = true }
  }, [isAuthenticated, hasSynced])

  return (
    <>
      <LoadingModal isOpen={!isLoading && isSyncing} message="데이터를 불러오는 중..." />
      {children}
    </>
  )
}
