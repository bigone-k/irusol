'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useVisionStore } from '@/store/useVisionStore'
import { useGoalStore } from '@/store/useGoalStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useTaskStore } from '@/store/useTaskStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { fetchAllData, syncAllStoresInOrder, fetchPlayerStats, syncPlayerStatsFull, clearSyncCache } from '@/lib/supabase/sync'
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

  // 로그아웃 시 캐시 초기화
  useEffect(() => {
    if (!isAuthenticated && hasSynced) {
      clearSyncCache()
      setHasSynced(false)
    }
  }, [isAuthenticated, hasSynced])

  // Supabase ↔ 로컬 양방향 동기화
  useEffect(() => {
    if (!isAuthenticated || hasSynced) return

    let cancelled = false

    const syncData = async () => {
      setIsSyncing(true)
      try {
        // 엔티티 데이터 + player_stats 병렬 fetch
        const [remote, remotePlayer] = await Promise.all([
          fetchAllData(),
          fetchPlayerStats(),
        ])
        if (cancelled) return

        const local = {
          vision: useVisionStore.getState().vision,
          goals: useGoalStore.getState().goals,
          projects: useProjectStore.getState().projects,
          tasks: useTaskStore.getState().tasks,
        }

        // --- player_stats 동기화 ---
        const localPlayer = usePlayerStore.getState()
        if (remotePlayer) {
          // DB 레벨이 더 높으면 DB 기준, 아니면 로컬 기준 → DB push
          if (remotePlayer.level > localPlayer.level ||
            (remotePlayer.level === localPlayer.level && remotePlayer.experience > localPlayer.experience)) {
            usePlayerStore.getState().hydrate(remotePlayer)
          } else if (localPlayer.level > remotePlayer.level ||
            (localPlayer.level === remotePlayer.level && localPlayer.experience > remotePlayer.experience)) {
            syncPlayerStatsFull(localPlayer).catch((e) => console.error("[sync]", e))
          }
        } else {
          // DB에 row 없음 (비정상) → 로컬 push
          syncPlayerStatsFull(localPlayer).catch((e) => console.error("[sync]", e))
        }

        // --- 엔티티 데이터 동기화 ---
        const remoteHasData =
          remote.vision || remote.goals.length > 0 ||
          remote.projects.length > 0 || remote.tasks.length > 0

        const localHasData =
          local.vision || local.goals.length > 0 ||
          local.projects.length > 0 || local.tasks.length > 0

        if (remoteHasData) {
          const remoteIds = {
            goals: new Set(remote.goals.map((g) => g.id)),
            projects: new Set(remote.projects.map((p) => p.id)),
            tasks: new Set(remote.tasks.map((t) => t.id)),
          }

          const missing = {
            vision: local.vision && !remote.vision ? local.vision : null,
            goals: local.goals.filter((g) => !remoteIds.goals.has(g.id)),
            projects: local.projects.filter((p) => !remoteIds.projects.has(p.id)),
            tasks: local.tasks.filter((t) => !remoteIds.tasks.has(t.id)),
          }

          useVisionStore.getState().hydrate(remote.vision || local.vision)
          useGoalStore.getState().hydrate([...remote.goals, ...missing.goals])
          useProjectStore.getState().hydrate([...remote.projects, ...missing.projects])
          useTaskStore.getState().hydrate([...remote.tasks, ...missing.tasks])

          const hasMissing =
            missing.vision || missing.goals.length > 0 ||
            missing.projects.length > 0 || missing.tasks.length > 0
          if (hasMissing) {
            syncAllStoresInOrder(missing).catch((e) => console.error("[sync]", e))
          }
        } else if (localHasData) {
          syncAllStoresInOrder(local).catch((e) => console.error("[sync]", e))
        }
      } catch {
        // fetch 실패 → localStorage 유지
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
