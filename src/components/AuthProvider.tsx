'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useVisionStore } from '@/store/useVisionStore'
import { useGoalStore } from '@/store/useGoalStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useTaskStore } from '@/store/useTaskStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useOnboardingStore } from '@/store/useOnboardingStore'
import { createClient } from '@/lib/supabase/client'
import { fetchAllData, fetchPlayerStats, clearSyncCache } from '@/lib/supabase/sync'
import LoadingModal from './LoadingModal'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const pathname = usePathname()
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

  // 클라이언트 온보딩 체크 (middleware에서 DB 쿼리 제거 → 여기서 1회 처리)
  useEffect(() => {
    if (!isAuthenticated || !user || isLoading) return

    const pathWithoutLocale = pathname.replace(/^\/(ko|en)/, '') || '/'
    const isOnboardingPage = pathWithoutLocale === '/onboarding' || pathWithoutLocale.startsWith('/onboarding/')
    const isLoginPage = pathWithoutLocale === '/login'
    if (isLoginPage) return

    const checkOnboarding = async () => {
      try {
        const supabase = createClient()
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_onboarded')
          .eq('id', user.id)
          .maybeSingle()

        const isOnboarded = profile?.is_onboarded ?? false
        const locale = pathname.match(/^\/(ko|en)/)?.[1] || 'ko'

        if (!isOnboarded && !isOnboardingPage) {
          window.location.href = `/${locale}/onboarding`
        } else if (isOnboarded && isOnboardingPage) {
          window.location.href = `/${locale}/goals`
        }
      } catch {
        // 쿼리 실패 → 차단하지 않음
      }
    }

    checkOnboarding()
  }, [isAuthenticated, user, isLoading, pathname])

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
