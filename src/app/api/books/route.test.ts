import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockBook } from '@/test/fixtures'

vi.mock('@/lib/cache', () => ({
  getBooks: vi.fn(),
  invalidateCache: vi.fn(),
}))

vi.mock('@/lib/spreadsheet', () => ({
  getAllBooks: vi.fn(),
  saveBookToSpreadsheet: vi.fn(),
}))

import { getBooks, invalidateCache } from '@/lib/cache'
import { saveBookToSpreadsheet } from '@/lib/spreadsheet'

// テストリスト: GET /api/books & POST /api/books
// [ ] GET: キャッシュから書籍一覧を返す (200, isStale: false)
// [ ] GET: キャッシュ更新失敗時に古いキャッシュを isStale:true で返す
// [ ] GET: キャッシュなし+API障害で500を返す
// [ ] POST: 書籍を登録して201を返す
// [ ] POST: 不正ISBNで400を返す
// [ ] POST: ISBN重複で409を返す
// [ ] POST: Sheets API障害で500を返す

describe('GET /api/books', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('キャッシュから書籍一覧を返す', async () => {
    vi.mocked(getBooks).mockResolvedValue({
      books: [mockBook],
      isStale: false,
    })

    const { GET } = await import('./route')
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      books: [mockBook],
      isStale: false,
    })
  })

  it('キャッシュ更新失敗時に古いキャッシュをisStale:trueで返す', async () => {
    vi.mocked(getBooks).mockResolvedValue({
      books: [mockBook],
      isStale: true,
    })

    const { GET } = await import('./route')
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      books: [mockBook],
      isStale: true,
    })
  })

  it('キャッシュなし+API障害で500を返す', async () => {
    vi.mocked(getBooks).mockRejectedValue(new Error('Sheets API error'))

    const { GET } = await import('./route')
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({ error: 'Sheets API error' })
  })
})

describe('POST /api/books', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('書籍を登録して201を返す', async () => {
    vi.mocked(saveBookToSpreadsheet).mockResolvedValue(undefined)

    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isbn13: mockBook.isbn13,
        title: mockBook.title,
        author: mockBook.author,
        publisher: mockBook.publisher,
        ndc: mockBook.ndc,
        thumbnailUrl: mockBook.thumbnailUrl,
      }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(json.book).toMatchObject({
      isbn13: mockBook.isbn13,
      title: mockBook.title,
    })
    expect(json.book.createdAt).toBeDefined()
    expect(invalidateCache).toHaveBeenCalled()
  })

  it('不正ISBNで400を返す', async () => {
    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isbn13: 'invalid',
        title: 'テスト',
      }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBeDefined()
  })
})
