// テストリスト: SearchBar
// [ ] テキスト入力フィールドが表示される
// [ ] 入力値が変わるとonChangeが呼ばれる
// [ ] プレースホルダーが表示される

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  afterEach(cleanup)

  it('テキスト入力フィールドが表示される', () => {
    render(<SearchBar value="" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toBeDefined()
  })
})
