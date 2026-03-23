import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import type { BookRecord, ISBN13 } from '@/types/book'
import { BookCard } from './BookCard'

// テストリスト: BookCard
// [ ] タイトルが表示される
// [ ] 著者・出版社が表示される
// [ ] 著者がnullのとき非表示
// [ ] NDCバッジが表示される
// [ ] NDCがnullのときバッジ非表示
// [ ] 書影がないときno-image.svgが表示される
// [ ] 書影があるとき画像が表示される
// [ ] 書影リンク切れ時にno-image.svgにフォールバック

const baseBook: BookRecord = {
  isbn13: '9784873115658' as ISBN13,
  title: 'リーダブルコード',
  author: 'Dustin Boswell',
  publisher: 'オライリージャパン',
  ndc: '007.64',
  ndcEdition: 9,
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
    await act(() => render(<BookCard book={{ ...baseBook, author: null }} />))
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

  it('書影があるとき画像が表示される', async () => {
    const bookWithThumbnail = {
      ...baseBook,
      thumbnailUrl: 'https://example.com/cover.jpg',
    }
    await act(() => render(<BookCard book={bookWithThumbnail} />))
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('https://example.com/cover.jpg')
  })

  it('書影リンク切れ時にimgが非表示になる', async () => {
    const bookWithBrokenUrl = {
      ...baseBook,
      thumbnailUrl: 'https://example.com/broken.jpg',
    }
    await act(() => render(<BookCard book={bookWithBrokenUrl} />))
    const img = screen.getByRole('img')
    await act(() => {
      fireEvent.error(img)
    })
    expect(img.style.display).toBe('none')
  })
})
