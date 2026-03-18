// テストリスト: RegisterForm
// [ ] ISBNを入力して検索ボタンを押すと書誌情報が表示される
// [ ] 書誌情報が取得できない場合は手入力フォームが表示される
// [ ] 「登録」ボタンを押すとPOST /api/booksが呼ばれる
// [ ] 登録成功時に「登録しました」が表示される
// [ ] ISBN重複時に「すでに登録されています」が表示される
// [ ] 登録エラー時にエラーメッセージが表示される

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterForm } from './RegisterForm'

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

  it('ISBNを入力して検索ボタンを押すと書誌情報が表示される', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ book: mockBook }),
    } as Response)

    await act(() => render(<RegisterForm />))
    await userEvent.type(screen.getByPlaceholderText('ISBNを入力'), '9784873115658')
    await userEvent.click(screen.getByRole('button', { name: '検索' }))

    await waitFor(() => {
      expect(screen.getByText('リーダブルコード')).toBeDefined()
    })
  })
})
