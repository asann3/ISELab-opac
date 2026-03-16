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
})
