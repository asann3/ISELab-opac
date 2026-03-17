import { describe, it, expect, afterEach } from 'vitest'
import { act } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { BookCard } from './BookCard'
import type { BookRecord, ISBN13 } from '@/types/book'

// テストリスト: BookCard
// [ ] タイトルが表示される
// [ ] 著者・出版社が表示される
// [ ] 著者がnullのとき非表示
// [ ] NDCバッジが表示される
// [ ] NDCがnullのときバッジ非表示
// [ ] 書影がないときno-image.svgが表示される
// [ ] 書影があるとき画像が表示される

const baseBook: BookRecord = {
  isbn13: '9784873115658' as ISBN13,
  title: 'リーダブルコード',
  author: 'Dustin Boswell',
  publisher: 'オライリージャパン',
  ndc: '007.64',
  thumbnailUrl: null,
  createdAt: '2025-01-01T00:00:00.000Z',
}

describe('BookCard', () => {
  afterEach(cleanup)
  it('タイトルが表示される', async () => {
    await act(() => render(<BookCard book={baseBook} />))
    expect(screen.getByText('リーダブルコード')).toBeDefined()
  })

  it('著者・出版社が表示される', async () => {
    await act(() => render(<BookCard book={baseBook} />))
    expect(screen.getByText('Dustin Boswell')).toBeDefined()
    expect(screen.getByText('オライリージャパン')).toBeDefined()
  })

  it('著者がnullのとき非表示', async () => {
    await act(() =>
      render(<BookCard book={{ ...baseBook, author: null }} />),
    )
    expect(screen.queryByText('Dustin Boswell')).toBeNull()
  })

  it('NDCバッジが表示される', async () => {
    await act(() => render(<BookCard book={baseBook} />))
    expect(screen.getByText('007.64')).toBeDefined()
  })

  it('NDCがnullのときバッジ非表示', async () => {
    await act(() => render(<BookCard book={{ ...baseBook, ndc: null }} />))
    expect(screen.queryByText('007.64')).toBeNull()
  })

  it('書影がないときno-image.svgが表示される', async () => {
    await act(() => render(<BookCard book={baseBook} />))
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toContain('no-image')
  })
})
