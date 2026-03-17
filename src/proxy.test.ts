import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// テストリスト: proxy.ts (Basic認証)
// [ ] GET /api/books は認証なしで通過する
// [ ] POST /api/books に認証なしで401を返す
// [ ] POST /api/books に正しい認証で通過する
// [ ] POST /api/books に不正な認証で401を返す
// [ ] /register に認証なしで401を返す
// [ ] /register に正しい認証で通過する
// [ ] 静的ファイル（/_next/等）は認証不要で通過する

const TEST_PASSWORD = 'test-password'

function createRequest(
  path: string,
  options?: { method?: string; authorization?: string },
) {
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

describe('proxy', () => {
  beforeEach(() => {
    vi.stubEnv('BASIC_AUTH_PASSWORD', TEST_PASSWORD)
  })

  it('GET /api/books は認証なしで通過する', async () => {
    const { proxy } = await import('./proxy')
    const request = createRequest('/api/books')
    const response = proxy(request)

    expect(response.status).not.toBe(401)
  })

  it('POST /api/books に認証なしで401を返す', async () => {
    const { proxy } = await import('./proxy')
    const request = createRequest('/api/books', { method: 'POST' })
    const response = proxy(request)

    expect(response.status).toBe(401)
    expect(response.headers.get('WWW-Authenticate')).toBe('Basic')
  })

  it('POST /api/books に正しい認証で通過する', async () => {
    const { proxy } = await import('./proxy')
    const request = createRequest('/api/books', {
      method: 'POST',
      authorization: basicAuth(TEST_PASSWORD),
    })
    const response = proxy(request)

    expect(response.status).not.toBe(401)
  })

  it('POST /api/books に不正な認証で401を返す', async () => {
    const { proxy } = await import('./proxy')
    const request = createRequest('/api/books', {
      method: 'POST',
      authorization: basicAuth('wrong-password'),
    })
    const response = proxy(request)

    expect(response.status).toBe(401)
  })

  it('/register に認証なしで401を返す', async () => {
    const { proxy } = await import('./proxy')
    const request = createRequest('/register')
    const response = proxy(request)

    expect(response.status).toBe(401)
    expect(response.headers.get('WWW-Authenticate')).toBe('Basic')
  })

  it('/register に正しい認証で通過する', async () => {
    const { proxy } = await import('./proxy')
    const request = createRequest('/register', {
      authorization: basicAuth(TEST_PASSWORD),
    })
    const response = proxy(request)

    expect(response.status).not.toBe(401)
  })

  it('静的ファイルは認証不要で通過する', async () => {
    const { proxy } = await import('./proxy')
    const request = createRequest('/_next/static/chunk.js')
    const response = proxy(request)

    expect(response.status).not.toBe(401)
  })
})
