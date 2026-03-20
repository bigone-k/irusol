import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { clearSyncCache } from '@/lib/supabase/sync'
import type { User, SupabaseClient } from '@supabase/supabase-js'

const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

interface AuthState {
  user: User | null
  nickname: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAnonymous: boolean
  init: () => () => void
  signOut: () => Promise<void>
}

function getNameFromUser(user: User): string {
  return user.user_metadata?.name
    || user.user_metadata?.full_name
    || user.email?.split('@')[0]
    || 'User'
}

function tryFetchProfileNickname(supabase: SupabaseClient, user: User, set: (s: Partial<AuthState>) => void) {
  // Non-blocking DB fetch with 5s timeout — updates nickname if successful
  const query = supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .maybeSingle()

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))

  Promise.race([query, timeout])
    .then((result) => {
      if (result && 'data' in result && result.data?.nickname) {
        set({ nickname: result.data.nickname })
      }
    })
    .catch(() => {
      // Network error — keep metadata nickname
    })
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  nickname: null,
  isLoading: true,
  isAuthenticated: false,
  isAnonymous: false,

  init: () => {
    if (!hasSupabaseConfig) {
      set({ isLoading: false })
      return () => {}
    }

    const supabase = createClient()

    const handleUser = (user: User | null) => {
      if (user) {
        if (user.is_anonymous) {
          // Anonymous user — no nickname, skip profile fetch
          set({ user, nickname: null, isLoading: false, isAuthenticated: true, isAnonymous: true })
        } else {
          // Regular user — set nickname from metadata, then try profile
          const metadataName = getNameFromUser(user)
          set({ user, nickname: metadataName, isLoading: false, isAuthenticated: true, isAnonymous: false })
          tryFetchProfileNickname(supabase, user, set)
        }
      } else {
        set({ user: null, nickname: null, isLoading: false, isAuthenticated: false, isAnonymous: false })
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  },

  signOut: async () => {
    if (!hasSupabaseConfig) return
    const supabase = createClient()
    await supabase.auth.signOut()

    // 모든 store 초기화 (다른 계정 로그인 시 데이터 혼선 방지)
    const { useVisionStore } = require('@/store/useVisionStore')
    const { useGoalStore } = require('@/store/useGoalStore')
    const { useProjectStore } = require('@/store/useProjectStore')
    const { useTaskStore } = require('@/store/useTaskStore')
    const { useOnboardingStore } = require('@/store/useOnboardingStore')
    const { usePlayerStore } = require('@/store/usePlayerStore')

    useVisionStore.getState().reset()
    useGoalStore.getState().reset()
    useProjectStore.getState().reset()
    useTaskStore.getState().reset()
    useOnboardingStore.getState().reset()
    usePlayerStore.getState().reset()
    clearSyncCache()

    set({ user: null, nickname: null, isAuthenticated: false, isAnonymous: false })
    const locale = window.location.pathname.match(/^\/(ko|en)/)?.[1] || 'ko'
    window.location.href = `/${locale}/login`
  },
}))
