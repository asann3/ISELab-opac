import { BookList } from '@/components/BookList'
import { getBooks } from '@/lib/cache'
import { getAllBooks } from '@/lib/spreadsheet'

export const metadata = {
  title: 'ISE Lab OPAC',
}

export default async function Page() {
  const { books, isStale } = await getBooks(getAllBooks)

  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-xl font-bold">ISE Lab OPAC</h1>
      <BookList books={books} isStale={isStale} />
    </main>
  )
}
