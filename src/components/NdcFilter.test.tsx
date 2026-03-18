// テストリスト: NdcFilter
// [ ] 「すべて」ボタンが表示される
// [ ] NDCコードとラベルの選択肢が表示される
// [ ] 選択肢をクリックするとonChangeが呼ばれる
// [ ] 「すべて」をクリックするとonChangeがnullで呼ばれる
// [ ] 選択中のNDCがハイライトされる

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NdcFilter } from './NdcFilter'

describe('NdcFilter', () => {
  afterEach(cleanup)

  it('「すべて」ボタンが表示される', async () => {
    await act(() =>
      render(
        <NdcFilter ndcList={['007', '547']} selected={null} onChange={() => {}} />,
      ),
    )
    expect(screen.getByText('すべて')).toBeDefined()
  })

  it('NDCコードとラベルの選択肢が表示される', async () => {
    await act(() =>
      render(
        <NdcFilter ndcList={['007', '547']} selected={null} onChange={() => {}} />,
      ),
    )
    expect(screen.getByText('007 情報科学')).toBeDefined()
    expect(screen.getByText('547 通信工学．電気通信')).toBeDefined()
  })

  it('選択肢をクリックするとonChangeが呼ばれる', async () => {
    const onChange = vi.fn()
    await act(() =>
      render(
        <NdcFilter ndcList={['007', '547']} selected={null} onChange={onChange} />,
      ),
    )
    await userEvent.click(screen.getByText('007 情報科学'))
    expect(onChange).toHaveBeenCalledWith('007')
  })

  it('「すべて」をクリックするとonChangeがnullで呼ばれる', async () => {
    const onChange = vi.fn()
    await act(() =>
      render(
        <NdcFilter ndcList={['007']} selected={'007'} onChange={onChange} />,
      ),
    )
    await userEvent.click(screen.getByText('すべて'))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('選択中のNDCがハイライトされる', async () => {
    await act(() =>
      render(
        <NdcFilter ndcList={['007', '547']} selected={'007'} onChange={() => {}} />,
      ),
    )
    const selected = screen.getByText('007 情報科学')
    const unselected = screen.getByText('547 通信工学．電気通信')
    expect(selected.getAttribute('aria-pressed')).toBe('true')
    expect(unselected.getAttribute('aria-pressed')).toBe('false')
  })
})
