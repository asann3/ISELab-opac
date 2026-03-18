// テストリスト: normalizeNdc
// [x] "547.28" → "547" に正規化できる
// [x] "007" → "007" にそのまま返す
// 1-2桁ケースはNDL APIで発生しないためスキップ

// テストリスト: getNdcLabel
// [ ] NDCコード "007" のラベル "情報科学" を取得できる
// [x] 存在しないNDCコードはundefinedを返す

import { describe, expect, it } from 'vitest'
import { getNdcLabel, normalizeNdc } from './ndc'

describe('normalizeNdc', () => {
  it('"547.28" → "547" に正規化できる', () => {
    expect(normalizeNdc('547.28')).toBe('547')
  })

  it('"007" → "007" にそのまま返す', () => {
    expect(normalizeNdc('007')).toBe('007')
  })
})

describe('getNdcLabel', () => {
  it('NDCコード "007" のラベル "情報科学" を取得できる', () => {
    expect(getNdcLabel('007')).toBe('情報科学')
  })

  it('存在しないNDCコードはundefinedを返す', () => {
    expect(getNdcLabel('999')).toBeUndefined()
  })
})
