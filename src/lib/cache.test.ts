import { describe, expect, it, vi } from 'vitest'
import type { BookRecord } from '@/types/book'
import { getBooks, invalidateCache } from './cache'

const mockBook: BookRecord = {
  isbn13: '9784274217886' as BookRecord['isbn13'],
  title: 'テスト書籍',
  author: '著者',
  publisher: '出版社',
  ndc: '007',
  thumbnailUrl: null,
  createdAt: '2026-03-10T00:00:00Z',
}

describe('cache', () => {
  it('キャッシュが空の状態でfetcherを呼びデータを返す', async () => {
    invalidateCache()
    const fetcher = vi.fn().mockResolvedValue([mockBook])

    const result = await getBooks(fetcher)

    expect(fetcher).toHaveBeenCalledOnce()
    expect(result).toEqual({ books: [mockBook], isStale: false })
  })

  it('TTL内なら2回目はfetcherを呼ばずキャッシュを返す', async () => {
    invalidateCache()
    const fetcher = vi.fn().mockResolvedValue([mockBook])

    await getBooks(fetcher)
    const result = await getBooks(fetcher)

    expect(fetcher).toHaveBeenCalledOnce()
    expect(result).toEqual({ books: [mockBook], isStale: false })
  })

  it('TTL超過後はfetcherを再度呼ぶ', async () => {
    invalidateCache()
    const fetcher = vi.fn().mockResolvedValue([mockBook])

    await getBooks(fetcher)

    vi.useFakeTimers()
    vi.advanceTimersByTime(60_001)
    await getBooks(fetcher)
    vi.useRealTimers()

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('invalidate後はfetcherを再度呼ぶ', async () => {
    invalidateCache()
    const fetcher = vi.fn().mockResolvedValue([mockBook])

    await getBooks(fetcher)
    invalidateCache()
    await getBooks(fetcher)

    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
