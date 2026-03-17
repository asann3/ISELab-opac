'use client'

import type { BookRecord } from '@/types/book'

interface BookCardProps {
  book: BookRecord
}

export function BookCard({ book }: BookCardProps) {
  const imgSrc = book.thumbnailUrl ?? '/no-image.svg'

  return (
    <div className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm bg-muted bg-[url('/no-image.svg')] bg-cover bg-center bg-no-repeat">
        <img
          src={imgSrc}
          alt={book.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/no-image.svg'
          }}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="truncate text-sm font-semibold leading-tight">
          {book.title}
        </div>
        {book.author && (
          <div className="truncate text-xs text-muted-foreground">
            {book.author}
          </div>
        )}
        {book.publisher && (
          <div className="truncate text-xs text-muted-foreground">
            {book.publisher}
          </div>
        )}
        {book.ndc && (
          <span className="mt-1 inline-flex w-fit items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            {book.ndc}
          </span>
        )}
      </div>
    </div>
  )
}
