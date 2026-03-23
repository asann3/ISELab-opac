import { NextResponse } from 'next/server'
import { getBooks, invalidateCache } from '@/lib/cache'
import { formatToIsbn13 } from '@/lib/isbn'
import {
  DuplicateIsbnError,
  getAllBooks,
  saveBookToSpreadsheet,
} from '@/lib/spreadsheet'
import type { BookRecord } from '@/types/book'

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

  let isbn13: ReturnType<typeof formatToIsbn13>
  try {
    isbn13 = formatToIsbn13(body.isbn13 ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid ISBN format' }, { status: 400 })
  }

  const book: BookRecord = {
    isbn13,
    title: body.title,
    author: body.author ?? null,
    publisher: body.publisher ?? null,
    ndc: body.ndc ?? null,
    ndcEdition: body.ndcEdition ?? null,
    thumbnailUrl: body.thumbnailUrl ?? null,
    createdAt: new Date().toISOString(),
  }

  try {
    await saveBookToSpreadsheet(book)
  } catch (error) {
    if (error instanceof DuplicateIsbnError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    const message =
      error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  invalidateCache()
  return NextResponse.json({ book }, { status: 201 })
}
