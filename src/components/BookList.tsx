'use client'

import { useState } from 'react'
import type { BookRecord } from '@/types/book'
import { BookCard } from './BookCard'
import { SearchBar } from './SearchBar'

type BookListProps = {
  books: BookRecord[]
}

export function BookList({ books }: BookListProps) {
  const [query, setQuery] = useState('')

  const filtered = books.filter((book) => {
    if (!query) return true
    const q = query.toLowerCase()
    return book.title.toLowerCase().includes(q)
  })

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} />
      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((book) => (
          <BookCard key={book.isbn13} book={book} />
        ))}
      </div>
    </div>
  )
}
