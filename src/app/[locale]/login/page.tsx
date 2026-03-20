'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { FiUser } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const t = useTranslations('login')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)

  const hasError = searchParams.get('error') === 'auth'

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?locale=${locale}`,
      },
    })
  }

  const handleGuestLogin = async () => {
    setIsGuestLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      window.location.href = `/${locale}/onboarding`
    } catch {
      setIsGuestLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-primary-light/30 via-secondary/20 to-background">
      <div className="flex flex-col items-center w-full max-w-sm">
        {/* Mascot */}
        <Image
          src="/img/duto_mascot_transparent.png"
          alt="DuTo mascot"
          width={192}
          height={192}
          className="w-48 h-48 object-contain mb-6"
          priority
        />

        {/* Tag pill */}
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/15 text-primary-dark text-xs font-semibold mb-4">
          {t('tag')}
        </span>

        {/* Heading */}
        <h1 className="text-center mb-3">
          <span className="block text-2xl font-bold text-primary">{t('headingGreen')}</span>
          <span className="block text-2xl font-bold text-text">{t('headingBlack')}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-text-muted text-center mb-8">
          {t('subtitle')}
        </p>

        {/* Error banner */}
        {hasError && (
          <div className="w-full px-4 py-3 mb-4 rounded-xl bg-accent/10 border border-accent/30 text-accent text-sm text-center font-medium">
            {t('error')}
          </div>
        )}

        {/* CTA text */}
        <p className="text-sm font-medium text-text text-center mb-3">
          {t('cta')}
        </p>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-border rounded-xl hover:bg-background transition-colors text-text font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin text-text-muted" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('loading')}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('googleButton')}
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted">{t('or')}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Guest Login Button */}
        <button
          onClick={handleGuestLogin}
          disabled={isGuestLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary/10 border border-primary/30 rounded-xl hover:bg-primary/20 transition-colors text-primary-dark font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGuestLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin text-primary-dark" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('guestLoading')}
            </>
          ) : (
            <>
              <FiUser size={20} />
              {t('guestButton')}
            </>
          )}
        </button>

        {/* Terms */}
        <p className="text-xs text-text-muted text-center mt-6">
          {t('terms')}
        </p>
      </div>
    </div>
  )
}
