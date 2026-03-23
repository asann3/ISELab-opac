'use client'

import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import type { BookRecord } from '@/types/book'

interface BookCardProps {
  book: BookRecord
}

export function BookCard({ book }: BookCardProps) {
  const imgSrc = book.thumbnailUrl ?? '/no-image.svg'
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      imgRef.current.style.opacity = '1'
    }
  }, [])

  return (
    <div className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm bg-muted bg-[url('/no-image.svg')] bg-cover bg-center bg-no-repeat">
        <img
          ref={imgRef}
          src={imgSrc}
          alt={book.title}
          className="h-full w-full object-cover"
          style={{ opacity: 0 }}
          onLoad={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
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
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {book.ndc}
          </Badge>
        )}
      </div>
    </div>
  )
}
