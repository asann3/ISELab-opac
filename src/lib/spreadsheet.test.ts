import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BookRecord } from '@/types/book'

// テストリスト: spreadsheet.ts
// [ ] getAllBooks: スプレッドシートから全行をBookRecord[]として返す
// [ ] getAllBooks: データが空の場合は空配列を返す
// [ ] getAllBooks: null値のセルをnullとして扱う
// [ ] saveBookToSpreadsheet: BookRecordをスプレッドシートの末尾に追記する
// [ ] saveBookToSpreadsheet: ISBN重複時にDuplicateIsbnErrorを投げる

const mockGet = vi.fn()
const mockAppend = vi.fn()

vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn().mockImplementation(() => ({})),
    },
    sheets: vi.fn().mockReturnValue({
      spreadsheets: {
        values: {
          get: (...args: unknown[]) => mockGet(...args),
          append: (...args: unknown[]) => mockAppend(...args),
        },
      },
    }),
  },
}))

import { getAllBooks } from './spreadsheet'

describe('getAllBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('スプレッドシートから全行をBookRecord[]として返す', async () => {
    mockGet.mockResolvedValue({
      data: {
        values: [
          ['isbn13', 'title', 'author', 'publisher', 'ndc', 'thumbnailUrl', 'createdAt'],
          ['9784274217886', 'テスト書籍', '著者', '出版社', '007', 'https://example.com/thumb.jpg', '2026-03-10T00:00:00Z'],
        ],
      },
    })

    const result = await getAllBooks()

    expect(result).toEqual([
      {
        isbn13: '9784274217886',
        title: 'テスト書籍',
        author: '著者',
        publisher: '出版社',
        ndc: '007',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        createdAt: '2026-03-10T00:00:00Z',
      },
    ])
  })

  it('データが空の場合は空配列を返す', async () => {
    mockGet.mockResolvedValue({
      data: {
        values: [
          ['isbn13', 'title', 'author', 'publisher', 'ndc', 'thumbnailUrl', 'createdAt'],
        ],
      },
    })

    const result = await getAllBooks()

    expect(result).toEqual([])
  })

  it('null値のセルをnullとして扱う', async () => {
    mockGet.mockResolvedValue({
      data: {
        values: [
          ['isbn13', 'title', 'author', 'publisher', 'ndc', 'thumbnailUrl', 'createdAt'],
          ['9784274217886', 'テスト書籍', '', '', '', '', '2026-03-10T00:00:00Z'],
        ],
      },
    })

    const result = await getAllBooks()

    expect(result).toEqual([
      {
        isbn13: '9784274217886',
        title: 'テスト書籍',
        author: null,
        publisher: null,
        ndc: null,
        thumbnailUrl: null,
        createdAt: '2026-03-10T00:00:00Z',
      },
    ])
  })
})
