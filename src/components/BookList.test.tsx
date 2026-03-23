// テストリスト: BookList
// [x] 書籍一覧が表示される
// [x] SearchBarに入力するとタイトルでフィルタリングされる
// [x] SearchBarに入力すると著者名でもフィルタリングされる
// [x] NdcFilterで分類を選択するとNDCでフィルタリングされる
// [x] NdcFilterで「すべて」を選択するとフィルタが解除される
// [x] テキスト検索とNDCフィルタを組み合わせて絞り込める
// [x] isStale=trueのときキャッシュ警告バナーが表示される
// [x] 表示中の件数が表示される
// [x] ndc=nullの本がある場合「未分類」フィルタが表示され、選択するとndc=nullの本だけ表示される

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
    ndcEdition: 9,
    thumbnailUrl: null,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    isbn13: '9784274217886' as ISBN13,
    title: 'プログラミング言語C',
    author: 'カーニハン',
    publisher: '共立出版',
    ndc: '547.02',
    ndcEdition: 9,
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

  it('テキスト検索とNDCフィルタを組み合わせて絞り込める', async () => {
    const books3: BookRecord[] = [
      ...books,
      {
        isbn13: '9784873119038' as ISBN13,
        title: 'Pythonではじめる機械学習',
        author: 'Andreas Müller',
        publisher: 'オライリージャパン',
        ndc: '007.13',
        ndcEdition: 9,
        thumbnailUrl: null,
        createdAt: '2025-01-03T00:00:00.000Z',
      },
    ]
    await act(() => render(<BookList books={books3} />))
    // NDC 007 でフィルタ → リーダブルコード・Python本が残る
    await userEvent.click(screen.getByText('007 情報科学'))
    // さらにタイトルで絞り込む
    const input = screen.getByPlaceholderText('タイトル・著者名で検索')
    await userEvent.type(input, 'Python')
    expect(screen.getByText('Pythonではじめる機械学習')).toBeDefined()
    expect(screen.queryByText('リーダブルコード')).toBeNull()
    expect(screen.queryByText('プログラミング言語C')).toBeNull()
  })

  it('ndc=nullの本がある場合「未分類」フィルタが表示され選択するとndc=nullの本だけ表示される', async () => {
    const booksWithNull: BookRecord[] = [
      ...books,
      {
        isbn13: '9784000000000' as ISBN13,
        title: 'NDCなしの本',
        author: null,
        publisher: null,
        ndc: null,
        ndcEdition: null,
        thumbnailUrl: null,
        createdAt: '2025-01-04T00:00:00.000Z',
      },
    ]
    await act(() => render(<BookList books={booksWithNull} />))
    expect(screen.getByText('未分類')).toBeDefined()
    await userEvent.click(screen.getByText('未分類'))
    expect(screen.getByText('NDCなしの本')).toBeDefined()
    expect(screen.queryByText('リーダブルコード')).toBeNull()
  })

  it('isStale=trueのときキャッシュ警告バナーが表示される', async () => {
    await act(() => render(<BookList books={books} isStale={true} />))
    expect(screen.getByRole('alert')).toBeDefined()
  })

  it('表示中の件数が表示される', async () => {
    await act(() => render(<BookList books={books} />))
    expect(screen.getByText('2件')).toBeDefined()

    const input = screen.getByPlaceholderText('タイトル・著者名で検索')
    await userEvent.type(input, 'リーダブル')
    expect(screen.getByText('1件')).toBeDefined()
  })
})
