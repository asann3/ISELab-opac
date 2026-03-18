// テストリスト: BookList
// [ ] 書籍一覧が表示される
// [ ] SearchBarに入力するとタイトルでフィルタリングされる
// [ ] SearchBarに入力すると著者名でもフィルタリングされる
// [ ] NdcFilterで分類を選択するとNDCでフィルタリングされる
// [ ] NdcFilterで「すべて」を選択するとフィルタが解除される
// [ ] テキスト検索とNDCフィルタを組み合わせて絞り込める

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import type { BookRecord, ISBN13 } from '@/types/book'
import { BookList } from './BookList'

const books: BookRecord[] = [
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
    isbn13: '9784274217886' as ISBN13,
    title: 'プログラミング言語C',
    author: 'カーニハン',
    publisher: '共立出版',
    ndc: '547.02',
    thumbnailUrl: null,
    createdAt: '2025-01-02T00:00:00.000Z',
  },
]

describe('BookList', () => {
  afterEach(cleanup)

  it('書籍一覧が表示される', async () => {
    await act(() => render(<BookList books={books} />))
    expect(screen.getByText('リーダブルコード')).toBeDefined()
    expect(screen.getByText('プログラミング言語C')).toBeDefined()
  })

  it('SearchBarに入力するとタイトルでフィルタリングされる', async () => {
    await act(() => render(<BookList books={books} />))
    const input = screen.getByPlaceholderText('タイトル・著者名で検索')
    await userEvent.type(input, 'リーダブル')
    expect(screen.getByText('リーダブルコード')).toBeDefined()
    expect(screen.queryByText('プログラミング言語C')).toBeNull()
  })

  it('SearchBarに入力すると著者名でもフィルタリングされる', async () => {
    await act(() => render(<BookList books={books} />))
    const input = screen.getByPlaceholderText('タイトル・著者名で検索')
    await userEvent.type(input, 'カーニハン')
    expect(screen.getByText('プログラミング言語C')).toBeDefined()
    expect(screen.queryByText('リーダブルコード')).toBeNull()
  })

  it('NdcFilterで分類を選択するとNDCでフィルタリングされる', async () => {
    await act(() => render(<BookList books={books} />))
    await userEvent.click(screen.getByText('007 情報科学'))
    expect(screen.getByText('リーダブルコード')).toBeDefined()
    expect(screen.queryByText('プログラミング言語C')).toBeNull()
  })

  it('NdcFilterで「すべて」を選択するとフィルタが解除される', async () => {
    await act(() => render(<BookList books={books} />))
    await userEvent.click(screen.getByText('007 情報科学'))
    expect(screen.queryByText('プログラミング言語C')).toBeNull()
    await userEvent.click(screen.getByText('すべて'))
    expect(screen.getByText('リーダブルコード')).toBeDefined()
    expect(screen.getByText('プログラミング言語C')).toBeDefined()
  })
})
