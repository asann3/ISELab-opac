'use client'

import type { BookRecord } from '@/types/book'
import { BookCard } from './BookCard'

type BookListProps = {
  books: BookRecord[]
}

export function BookList({ books }: BookListProps) {
  return (
    <div className="flex flex-col gap-3">
      {books.map((book) => (
        <BookCard key={book.isbn13} book={book} />
      ))}
    </div>
  )
}
