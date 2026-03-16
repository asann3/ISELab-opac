import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockBook } from '@/test/fixtures'

// テストリスト: spreadsheet.ts
// [x] getAllBooks: スプレッドシートから全行をBookRecord[]として返す
// [x] getAllBooks: データが空の場合は空配列を返す
// [x] getAllBooks: null値のセルをnullとして扱う
// [x] saveBookToSpreadsheet: BookRecordをスプレッドシートの末尾に追記する
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

import {
  DuplicateIsbnError,
  getAllBooks,
  saveBookToSpreadsheet,
} from './spreadsheet'

const HEADER_ROW = ['isbn13', 'title', 'author', 'publisher', 'ndc', 'thumbnailUrl', 'createdAt']

const toRow = (book: typeof mockBook) => [
  book.isbn13,
  book.title,
  book.author ?? '',
  book.publisher ?? '',
  book.ndc ?? '',
  book.thumbnailUrl ?? '',
  book.createdAt,
]

describe('getAllBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('スプレッドシートから全行をBookRecord[]として返す', async () => {
    mockGet.mockResolvedValue({
      data: { values: [HEADER_ROW, toRow(mockBook)] },
    })

    const result = await getAllBooks()

    expect(result).toEqual([mockBook])
  })

  it('データが空の場合は空配列を返す', async () => {
    mockGet.mockResolvedValue({
      data: { values: [HEADER_ROW] },
    })

    const result = await getAllBooks()

    expect(result).toEqual([])
  })

  it('null値のセルをnullとして扱う', async () => {
    mockGet.mockResolvedValue({
      data: {
        values: [
          HEADER_ROW,
          [mockBook.isbn13, mockBook.title, '', '', '', '', mockBook.createdAt],
        ],
      },
    })

    const result = await getAllBooks()

    expect(result).toEqual([
      {
        ...mockBook,
        author: null,
        publisher: null,
        ndc: null,
        thumbnailUrl: null,
      },
    ])
  })
})

describe('saveBookToSpreadsheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('BookRecordをスプレッドシートの末尾に追記する', async () => {
    mockGet.mockResolvedValue({
      data: { values: [HEADER_ROW] },
    })
    mockAppend.mockResolvedValue({})

    await saveBookToSpreadsheet(mockBook)

    expect(mockAppend).toHaveBeenCalledOnce()
  })

  it('ISBN重複時にDuplicateIsbnErrorを投げる', async () => {
    mockGet.mockResolvedValue({
      data: { values: [HEADER_ROW, toRow(mockBook)] },
    })

    await expect(saveBookToSpreadsheet(mockBook)).rejects.toThrow(
      DuplicateIsbnError,
    )
  })
})
