'use client'

import { useState } from 'react'
import type { BookRecord } from '@/types/book'
import { normalizeNdc } from '@/lib/ndc'
import { BookCard } from './BookCard'
import { NdcFilter } from './NdcFilter'
import { SearchBar } from './SearchBar'

type BookListProps = {
  books: BookRecord[]
}

export function BookList({ books }: BookListProps) {
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
      <SearchBar value={query} onChange={setQuery} />
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
