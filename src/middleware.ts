import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const publicPaths = ['/login']

function getPathWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/(ko|en)(\/|$)/, '/')
}

function isPublicPath(path: string): boolean {
  return publicPaths.some((p) => path === p || path.startsWith(p + '/'))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  const pathWithoutLocale = getPathWithoutLocale(pathname)
  const locale = pathname.match(/^\/(ko|en)/)?.[1] || 'ko'
  const isPublic = isPublicPath(pathWithoutLocale)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // No Supabase config → redirect non-public to login
  if (!supabaseUrl || !supabaseKey) {
    if (isPublic) return intlMiddleware(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // Supabase session check
  let supabaseResponse = NextResponse.next({ request })
  let user = null

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Auth failed → treat as unauthenticated
  }

  // Unauthenticated → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // Authenticated on login page → redirect to goals
  // (온보딩 체크는 auth/callback + 클라이언트에서 처리)
  if (user && isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/goals`
    return NextResponse.redirect(url)
  }

  // Intl routing
  const intlResponse = intlMiddleware(request)

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return intlResponse
}

export const config = {
  matcher: [
    '/',
    '/(ko|en)/:path*',
    '/auth/callback',
  ],
}
