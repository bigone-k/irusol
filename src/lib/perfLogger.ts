// ============================================================
// Supabase 성능 측정 로거
// - 클라이언트: 메모리에 배치 수집 → API Route로 flush
// - 서버(middleware): 직접 전송
// ============================================================

export interface PerfLogEntry {
  timestamp: string
  category: 'middleware' | 'auth' | 'sync-read' | 'sync-write' | 'onboarding'
  operation: string
  table_name?: string
  method?: string
  duration_ms: number
  status: 'success' | 'error'
  row_count?: number
  error_msg?: string
  user_id?: string
  context?: string
  metadata?: Record<string, unknown>
}

// ─── 배치 버퍼 (클라이언트 전용) ───
const buffer: PerfLogEntry[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

const FLUSH_INTERVAL = 10_000 // 10초
const FLUSH_SIZE = 20         // 20개 이상이면 즉시 flush

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flush()
  }, FLUSH_INTERVAL)
}

/** 버퍼의 로그를 API Route로 전송 */
export function flush() {
  if (buffer.length === 0) return

  const logs = buffer.splice(0, buffer.length)

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    // sendBeacon: 페이지 이탈 시에도 전송 보장
    navigator.sendBeacon('/api/perf-logs', JSON.stringify({ logs }))
  } else {
    fetch('/api/perf-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs }),
      keepalive: true,
    }).catch(() => {
      // 전송 실패 → 무시 (성능 로그가 앱을 방해하면 안 됨)
    })
  }
}

// 페이지 이탈 시 잔여 로그 전송
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

/** 로그 1건 추가 (버퍼에 수집, 임계치 도달 시 자동 flush) */
export function logPerf(entry: Omit<PerfLogEntry, 'timestamp'>) {
  const log: PerfLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  }

  buffer.push(log)

  if (buffer.length >= FLUSH_SIZE) {
    flush()
  } else {
    scheduleFlush()
  }
}

/**
 * 비동기 함수를 감싸서 자동으로 성능 로그를 남기는 헬퍼
 *
 * @example
 * const goals = await withPerfLog(
 *   { category: 'sync-read', operation: 'fetchGoals', table_name: 'goals', method: 'select', context: 'sync.ts' },
 *   async () => {
 *     const { data } = await supabase.from('goals').select('*')
 *     return data || []
 *   }
 * )
 */
export async function withPerfLog<T>(
  meta: {
    category: PerfLogEntry['category']
    operation: string
    table_name?: string
    method?: string
    context?: string
    user_id?: string
    metadata?: Record<string, unknown>
  },
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()

    const duration_ms = Math.round(performance.now() - start)
    const row_count = Array.isArray(result) ? result.length : undefined

    logPerf({
      ...meta,
      duration_ms,
      status: 'success',
      row_count,
    })

    return result
  } catch (err) {
    const duration_ms = Math.round(performance.now() - start)

    logPerf({
      ...meta,
      duration_ms,
      status: 'error',
      error_msg: err instanceof Error ? err.message : String(err),
    })

    throw err
  }
}
