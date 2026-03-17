import type { BookRecord } from '@/types/book'

interface BookCardProps {
  book: BookRecord
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div>
      <div>{book.title}</div>
      {book.author && <div>{book.author}</div>}
      {book.publisher && <div>{book.publisher}</div>}
      {book.ndc && <span>{book.ndc}</span>}
    </div>
  )
}