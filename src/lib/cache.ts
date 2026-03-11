import type { BookRecord } from '@/types/book'

type CacheEntry = {
  books: BookRecord[]
  timestamp: number
}

const TTL_MS = 60_000

let cache: CacheEntry | null = null

export async function getBooks(
  fetcher: () => Promise<BookRecord[]>,
): Promise<{ books: BookRecord[]; isStale: boolean }> {
  const now = Date.now()

  if (cache && now - cache.timestamp < TTL_MS) {
    return { books: cache.books, isStale: false }
  }

  try {
    const books = await fetcher()
    cache = { books, timestamp: now }
    return { books, isStale: false }
  } catch (error) {
    if (cache) {
      return { books: cache.books, isStale: true }
    }
    throw error
  }
}

export function invalidateCache(): void {
  cache = null
}
