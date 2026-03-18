// テストリスト: RegisterForm
// [x] ISBNを入力して検索ボタンを押すと書誌情報が表示される
// [x] ISBNを入力して検索ボタンを押すと書誌情報が表示される
// [ ] 書誌情報が取得できない場合は手入力フォームが表示される
// [x] 書誌情報が取得できない場合は手入力フォームが表示される
// [ ] 「登録」ボタンを押すとPOST /api/booksが呼ばれる
// [ ] 登録成功時に「登録しました」が表示される
// [ ] ISBN重複時に「すでに登録されています」が表示される
// [ ] 登録エラー時にエラーメッセージが表示される

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterForm } from './RegisterForm'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockBook = {
  isbn13: '9784873115658',
  title: 'リーダブルコード',
  author: 'Dustin Boswell',
  publisher: 'オライリージャパン',
  ndc: '007.64',
  thumbnailUrl: null,
  createdAt: '2025-01-01T00:00:00.000Z',
}

describe('RegisterForm', () => {
  afterEach(cleanup)

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('書誌情報が取得できない場合は手入力フォームが表示される', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ book: null }),
    } as Response)

    await act(() => render(<RegisterForm />))
    await userEvent.type(
      screen.getByPlaceholderText('ISBNを入力'),
      '9784873115658',
    )
    await userEvent.click(screen.getByRole('button', { name: '検索' }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('タイトル')).toBeDefined()
    })
  })

  it('ISBNを入力して検索ボタンを押すと書誌情報が表示される', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ book: mockBook }),
    } as Response)

    await act(() => render(<RegisterForm />))
    await userEvent.type(
      screen.getByPlaceholderText('ISBNを入力'),
      '9784873115658',
    )
    await userEvent.click(screen.getByRole('button', { name: '検索' }))

    await waitFor(() => {
      expect(screen.getByText('リーダブルコード')).toBeDefined()
    })
  })

  it('「登録」ボタンを押すとPOST /api/booksが呼ばれる', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ book: mockBook }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ book: mockBook }),
      } as Response)

    await act(() => render(<RegisterForm />))
    await userEvent.type(
      screen.getByPlaceholderText('ISBNを入力'),
      '9784873115658',
    )
    await userEvent.click(screen.getByRole('button', { name: '検索' }))
    await waitFor(() => screen.getByText('リーダブルコード'))
    await userEvent.click(screen.getByRole('button', { name: '登録' }))

    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        '/api/books',
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  it('登録成功時に「登録しました」が表示される', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ book: mockBook }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ book: mockBook }),
      } as Response)

    await act(() => render(<RegisterForm />))
    await userEvent.type(
      screen.getByPlaceholderText('ISBNを入力'),
      '9784873115658',
    )
    await userEvent.click(screen.getByRole('button', { name: '検索' }))
    await waitFor(() => screen.getByText('リーダブルコード'))
    await userEvent.click(screen.getByRole('button', { name: '登録' }))

    await waitFor(() => {
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('登録しました')
    })
  })

  it('ISBN重複時に「すでに登録されています」が表示される', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ book: mockBook }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'duplicate' }),
      } as Response)

    await act(() => render(<RegisterForm />))
    await userEvent.type(
      screen.getByPlaceholderText('ISBNを入力'),
      '9784873115658',
    )
    await userEvent.click(screen.getByRole('button', { name: '検索' }))
    await waitFor(() => screen.getByText('リーダブルコード'))
    await userEvent.click(screen.getByRole('button', { name: '登録' }))

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        'すでに登録されています',
      )
    })
  })

  it('登録エラー時にエラーメッセージが表示される', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ book: mockBook }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: '内部エラー' }),
      } as Response)

    await act(() => render(<RegisterForm />))
    await userEvent.type(
      screen.getByPlaceholderText('ISBNを入力'),
      '9784873115658',
    )
    await userEvent.click(screen.getByRole('button', { name: '検索' }))
    await waitFor(() => screen.getByText('リーダブルコード'))
    await userEvent.click(screen.getByRole('button', { name: '登録' }))

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('内部エラー')
    })
  })
})
