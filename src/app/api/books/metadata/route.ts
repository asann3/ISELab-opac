import { NextResponse } from 'next/server'
import { fetchBookMetadata } from '@/lib/bookMetadata'
import { formatToIsbn13 } from '@/lib/isbn'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const isbn = searchParams.get('isbn') ?? ''

  let isbn13: ReturnType<typeof formatToIsbn13>
  try {
    isbn13 = formatToIsbn13(isbn)
  } catch {
    return NextResponse.json({ error: 'Invalid ISBN format' }, { status: 400 })
  }

  const book = await fetchBookMetadata(isbn13)
  if (!book) {
    return NextResponse.json({ book: null }, { status: 404 })
  }

  return NextResponse.json({ book })
}
