import type { BookRecord } from '@/types/book'

interface BookCardProps {
  book: BookRecord
}

export function BookCard({ book }: BookCardProps) {
  return <div>{book.title}</div>
}