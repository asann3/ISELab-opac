import { BookCard } from '@/components/BookCard'
import type { BookRecord, ISBN13 } from '@/types/book'

export const metadata = {
  title: 'ISE Lab OPAC',
}

const dummyBooks: BookRecord[] = [
  {
    isbn13: '9784873115658' as ISBN13,
    title: 'リーダブルコード',
    author: 'Dustin Boswell',
    publisher: 'オライリージャパン',
    ndc: '007.64',
    thumbnailUrl: null,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    isbn13: '9784297127831' as ISBN13,
    title: '良いコード／悪いコードで学ぶ設計入門',
    author: '仙塲大也',
    publisher: '技術評論社',
    ndc: '007.63',
    thumbnailUrl: 'https://cover.openbd.jp/9784297127831.jpg',
    createdAt: '2025-01-02T00:00:00.000Z',
  },
  {
    isbn13: '9784873117584' as ISBN13,
    title: 'テスト駆動開発',
    author: 'Kent Beck',
    publisher: 'オライリージャパン',
    ndc: null,
    thumbnailUrl: null,
    createdAt: '2025-01-03T00:00:00.000Z',
  },
]

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-xl font-bold">ISE Lab OPAC</h1>
      <div className="flex flex-col gap-3">
        {dummyBooks.map((book) => (
          <BookCard key={book.isbn13} book={book} />
        ))}
      </div>
    </main>
  )
}
