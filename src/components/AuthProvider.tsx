'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useVisionStore } from '@/store/useVisionStore'
import { useGoalStore } from '@/store/useGoalStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useTaskStore } from '@/store/useTaskStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useOnboardingStore } from '@/store/useOnboardingStore'
import { fetchAllData, fetchPlayerStats, clearSyncCache } from '@/lib/supabase/sync'
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

  // Reset-first → DB fetch only (이전 유저 localStorage 오염 방지)
  useEffect(() => {
    if (!isAuthenticated || hasSynced) return

    let cancelled = false

    const syncData = async () => {
      setIsSyncing(true)
      try {
        // 1) 모든 store 초기화 — localStorage에 남은 이전 유저 데이터 제거
        useVisionStore.getState().reset()
        useGoalStore.getState().reset()
        useProjectStore.getState().reset()
        useTaskStore.getState().reset()
        usePlayerStore.getState().reset()
        useOnboardingStore.getState().reset()

        // 2) DB에서 현재 유저 데이터만 fetch
        const [remote, remotePlayer] = await Promise.all([
          fetchAllData(),
          fetchPlayerStats(),
        ])
        if (cancelled) return

        // 3) DB 데이터로 hydrate (DB = source of truth)
        if (remotePlayer) {
          usePlayerStore.getState().hydrate(remotePlayer)
        }
        useVisionStore.getState().hydrate(remote.vision)
        useGoalStore.getState().hydrate(remote.goals)
        useProjectStore.getState().hydrate(remote.projects)
        useTaskStore.getState().hydrate(remote.tasks)
      } catch {
        // fetch 실패 → 초기 상태 유지 (빈 데이터)
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
