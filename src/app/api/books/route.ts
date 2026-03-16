import { NextResponse } from 'next/server'
import { getBooks, invalidateCache } from '@/lib/cache'
import { getAllBooks, saveBookToSpreadsheet } from '@/lib/spreadsheet'
import type { BookRecord, ISBN13 } from '@/types/book'

export async function GET() {
  try {
    const { books, isStale } = await getBooks(getAllBooks)
    return NextResponse.json({ books, isStale })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()

  const book: BookRecord = {
    isbn13: body.isbn13 as ISBN13,
    title: body.title,
    author: body.author ?? null,
    publisher: body.publisher ?? null,
    ndc: body.ndc ?? null,
    thumbnailUrl: body.thumbnailUrl ?? null,
    createdAt: new Date().toISOString(),
  }

  await saveBookToSpreadsheet(book)
  invalidateCache()
  return NextResponse.json({ book }, { status: 201 })
}
