import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = searchParams.get('locale') ?? 'ko'
  const linking = searchParams.get('linking') === 'true'
  const next = searchParams.get('next') ?? `/${locale}/goals`

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Cookie setting in Server Component context
            }
          },
        },
      }
    )

    let exchangeStart = Date.now()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log(JSON.stringify({
      type: 'supabase_perf', timestamp: new Date().toISOString(),
      category: 'auth', operation: 'exchangeCodeForSession', method: 'auth.exchangeCodeForSession',
      duration_ms: Date.now() - exchangeStart, status: error ? 'error' : 'success',
      error_msg: error?.message || null, context: 'auth/callback',
    }))

    if (!error) {
      if (linking) {
        return NextResponse.redirect(`${origin}/${locale}/goals`)
      }

      const authStart = Date.now()
      const { data: { user } } = await supabase.auth.getUser()
      console.log(JSON.stringify({
        type: 'supabase_perf', timestamp: new Date().toISOString(),
        category: 'auth', operation: 'auth.getUser', method: 'auth.getUser',
        duration_ms: Date.now() - authStart, status: 'success',
        user_id: user?.id || null, context: 'auth/callback',
      }))

      if (user) {
        const profileStart = Date.now()
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_onboarded')
          .eq('id', user.id)
          .single()
        console.log(JSON.stringify({
          type: 'supabase_perf', timestamp: new Date().toISOString(),
          category: 'onboarding', operation: 'checkOnboarding', table_name: 'profiles', method: 'select',
          duration_ms: Date.now() - profileStart, status: 'success',
          user_id: user.id, context: 'auth/callback',
        }))

        if (!profile?.is_onboarded) {
          return NextResponse.redirect(`${origin}/${locale}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`)
}
