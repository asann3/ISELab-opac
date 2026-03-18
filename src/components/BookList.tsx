'use client'

import { useState } from 'react'
import { normalizeNdc } from '@/lib/ndc'
import type { BookRecord } from '@/types/book'
import { BookCard } from './BookCard'
import { NdcFilter } from './NdcFilter'
import { SearchBar } from './SearchBar'

type BookListProps = {
  books: BookRecord[]
  isStale?: boolean
}

export function BookList({ books, isStale = false }: BookListProps) {
  const [query, setQuery] = useState('')
  const [selectedNdc, setSelectedNdc] = useState<string | null>(null)

  const ndcList = [
    ...new Set(
      books
        .map((b) => b.ndc)
        .filter((ndc): ndc is string => ndc !== null)
        .map(normalizeNdc),
    ),
  ].sort()

  const filtered = books.filter((book) => {
    if (query) {
      const q = query.toLowerCase()
      if (
        !book.title.toLowerCase().includes(q) &&
        !(book.author?.toLowerCase().includes(q) ?? false)
      ) {
        return false
      }
    }
    if (selectedNdc && book.ndc) {
      if (normalizeNdc(book.ndc) !== selectedNdc) return false
    }
    if (selectedNdc && !book.ndc) return false
    return true
  })

  return (
    <div>
      {isStale && (
        <div
          role="alert"
          className="mb-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground"
        >
          表示中のデータは最新でない可能性があります
        </div>
      )}
      <SearchBar value={query} onChange={setQuery} />
      <div className="mt-3" />
      <NdcFilter
        ndcList={ndcList}
        selected={selectedNdc}
        onChange={setSelectedNdc}
      />
      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((book) => (
          <BookCard key={book.isbn13} book={book} />
        ))}
      </div>
    </div>
  )
}
