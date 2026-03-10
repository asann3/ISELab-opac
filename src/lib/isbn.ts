import type { ISBN13 } from '@/types/book'

export function formatToIsbn13(raw: string): ISBN13 {
  const stripped = raw.replace(/[-\s]/g, '')
  return stripped as ISBN13
}
