// テストリスト: normalizeNdc
// [ ] "547.28" → "547" に正規化できる
// [ ] "007" → "007" にそのまま返す
// [ ] "54" → "540" にゼロパディングする
// [ ] "7" → "700" にゼロパディングする

// テストリスト: getNdcLabel
// [ ] NDCコード "007" のラベル "情報科学" を取得できる
// [ ] 存在しないNDCコードはundefinedを返す

import { describe, expect, it } from 'vitest'
import { normalizeNdc } from './ndc'

describe('normalizeNdc', () => {
  it('"547.28" → "547" に正規化できる', () => {
    expect(normalizeNdc('547.28')).toBe('547')
  })
})
