import { NextResponse } from 'next/server'
import type { PerfLogEntry } from '@/lib/perfLogger'

/**
 * 클라이언트 성능 로그 수신 → Vercel 서버 로그(stdout)에 JSON 출력
 * Vercel Dashboard > Logs 에서 "supabase_perf" 로 필터링하여 조회
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const logs: PerfLogEntry[] = body?.logs

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ error: 'No logs provided' }, { status: 400 })
    }

    // 최대 100건까지만 처리 (남용 방지)
    const trimmed = logs.slice(0, 100)

    for (const log of trimmed) {
      console.log(JSON.stringify({
        type: 'supabase_perf',
        ...log,
      }))
    }

    return NextResponse.json({ logged: trimmed.length })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
