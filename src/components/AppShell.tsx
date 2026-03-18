'use client'

import { usePathname } from 'next/navigation'
import TopAppBar from '@/components/TopAppBar'
import BottomNavigation from '@/components/BottomNavigation'
import ToastContainer from '@/components/ToastContainer'
import AbsencePenaltyChecker from '@/components/AbsencePenaltyChecker'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Strip locale prefix to check route
  const pathWithoutLocale = pathname.replace(/^\/(ko|en)/, '') || '/'
  const isLoginPage = pathWithoutLocale === '/login' || pathWithoutLocale.startsWith('/login/')
  const isOnboardingPage = pathWithoutLocale === '/onboarding' || pathWithoutLocale.startsWith('/onboarding/')

  if (isLoginPage || isOnboardingPage) {
    return <main className="min-h-screen bg-background">{children}</main>
  }

  return (
    <>
      <AbsencePenaltyChecker />
      <div className="flex flex-col min-h-screen">
        <TopAppBar title="DuTo" showMenu={true} showSearch={true} showAdd={false} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-md mx-auto pb-20">{children}</div>
        </main>
        <BottomNavigation />
        <ToastContainer />
      </div>
    </>
  )
}
