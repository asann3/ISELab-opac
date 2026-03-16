import { NextResponse } from 'next/server'
import { getBooks } from '@/lib/cache'
import { getAllBooks } from '@/lib/spreadsheet'

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
