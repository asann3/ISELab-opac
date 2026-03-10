import { describe, it, expect } from 'vitest'
import { formatToIsbn13 } from './isbn'

describe('formatToIsbn13', () => {
  it('ハイフン付きISBN-13を正規化できる', () => {
    const result = formatToIsbn13('978-4-274-21788-6')
    expect(result).toBe('9784274217886')
  })

  it('空白付きISBN-13を正規化できる', () => {
    const result = formatToIsbn13('978 4 274 21788 6')
    expect(result).toBe('9784274217886')
  })

  it('ISBN-10をISBN-13に変換できる', () => {
    // 『リーダブルコード』 ISBN-10: 4873115655 → ISBN-13: 9784873115658
    const result = formatToIsbn13('4873115655')
    expect(result).toBe('9784873115658')
  })
})
