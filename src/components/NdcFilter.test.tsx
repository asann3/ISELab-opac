// テストリスト: NdcFilter
// [x] 「すべて」ボタンが表示される
// [x] NDCコードとラベルの選択肢が表示される
// [x] 選択肢をクリックするとonChangeが呼ばれる
// [x] 「すべて」をクリックするとonChangeがnullで呼ばれる
// [x] 選択中のNDCがハイライトされる
// [x] hasUnclassified=trueのとき「未分類」ボタンが表示される
// [x] 「未分類」をクリックするとonChangeが'__unclassified__'で呼ばれる

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
        <NdcFilter
          ndcList={['007', '547']}
          selected={null}
          onChange={() => {}}
        />,
      ),
    )
    expect(screen.getByText('すべて')).toBeDefined()
  })

  it('NDCコードとラベルの選択肢が表示される', async () => {
    await act(() =>
      render(
        <NdcFilter
          ndcList={['007', '547']}
          selected={null}
          onChange={() => {}}
        />,
      ),
    )
    expect(screen.getByText('007 情報科学')).toBeDefined()
    expect(screen.getByText('547 通信工学．電気通信')).toBeDefined()
  })

  it('選択肢をクリックするとonChangeが呼ばれる', async () => {
    const onChange = vi.fn()
    await act(() =>
      render(
        <NdcFilter
          ndcList={['007', '547']}
          selected={null}
          onChange={onChange}
        />,
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

  it('hasUnclassified=trueのとき「未分類」ボタンが表示される', async () => {
    await act(() =>
      render(
        <NdcFilter
          ndcList={['007']}
          selected={null}
          onChange={() => {}}
          hasUnclassified={true}
        />,
      ),
    )
    expect(screen.getByText('未分類')).toBeDefined()
  })

  it("「未分類」をクリックするとonChangeが'__unclassified__'で呼ばれる", async () => {
    const onChange = vi.fn()
    await act(() =>
      render(
        <NdcFilter
          ndcList={['007']}
          selected={null}
          onChange={onChange}
          hasUnclassified={true}
        />,
      ),
    )
    await userEvent.click(screen.getByText('未分類'))
    expect(onChange).toHaveBeenCalledWith('__unclassified__')
  })

  it('選択中のNDCがハイライトされる', async () => {
    await act(() =>
      render(
        <NdcFilter
          ndcList={['007', '547']}
          selected={'007'}
          onChange={() => {}}
        />,
      ),
    )
    const selected = screen.getByText('007 情報科学')
    const unselected = screen.getByText('547 通信工学．電気通信')
    expect(selected.getAttribute('aria-pressed')).toBe('true')
    expect(unselected.getAttribute('aria-pressed')).toBe('false')
  })
})
