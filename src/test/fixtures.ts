import type { BookRecord } from '@/types/book'

export const mockBook: BookRecord = {
  isbn13: '9784274217886' as BookRecord['isbn13'],
  title: 'テスト書籍',
  author: '著者',
  publisher: '出版社',
  ndc: '007',
  ndcEdition: 9,
  thumbnailUrl: 'https://example.com/thumb.jpg',
  createdAt: '2026-03-10T00:00:00Z',
}
