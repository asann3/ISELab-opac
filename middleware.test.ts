import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// テストリスト: middleware.ts (Basic認証)
// [ ] GET /api/books は認証なしで通過する
// [ ] POST /api/books に認証なしで401を返す
// [ ] POST /api/books に正しい認証で通過する
// [ ] POST /api/books に不正な認証で401を返す
// [ ] /register に認証なしで401を返す
// [ ] /register に正しい認証で通過する
// [ ] 静的ファイル（/_next/等）は認証不要で通過する

const TEST_PASSWORD = 'test-password'

function createRequest(path: string, options?: { method?: string; authorization?: string }) {
  const url = `http://example.com${path}`
  const headers = new Headers()
  if (options?.authorization) {
    headers.set('Authorization', options.authorization)
  }
  return new NextRequest(url, {
    method: options?.method ?? 'GET',
    headers,
  })
}

function basicAuth(password: string) {
  return `Basic ${btoa(`admin:${password}`)}`
}

describe('middleware', () => {
  beforeEach(() => {
    vi.stubEnv('BASIC_AUTH_PASSWORD', TEST_PASSWORD)
  })

  it('GET /api/books は認証なしで通過する', async () => {
    const { middleware } = await import('./middleware')
    const request = createRequest('/api/books')
    const response = middleware(request)

    expect(response.status).not.toBe(401)
  })
})
