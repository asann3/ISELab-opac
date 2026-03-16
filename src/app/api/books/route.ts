import { NextResponse } from 'next/server'
import { getBooks } from '@/lib/cache'
import { getAllBooks } from '@/lib/spreadsheet'

export async function GET() {
  const { books, isStale } = await getBooks(getAllBooks)
  return NextResponse.json({ books, isStale })
}
