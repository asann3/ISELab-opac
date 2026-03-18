// テストリスト: NdcFilter
// [ ] 「すべて」ボタンが表示される
// [ ] NDCコードとラベルの選択肢が表示される
// [ ] 選択肢をクリックするとonChangeが呼ばれる
// [ ] 「すべて」をクリックするとonChangeがnullで呼ばれる
// [ ] 選択中のNDCがハイライトされる

import { cleanup, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
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
})
