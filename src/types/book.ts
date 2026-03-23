export type ISBN13 = string & { readonly __brand: 'ISBN13' }

export interface BookRecord {
  isbn13: ISBN13
  title: string
  author: string | null
  publisher: string | null
  ndc: string | null
  ndcEdition: 9 | 10 | null
  thumbnailUrl: string | null
  createdAt: string
}
