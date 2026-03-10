import { describe, expect, it } from 'vitest'
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

  it('末尾Xを持つISBN-10を変換できる', () => {
    // ISBN-10: 477414164X → ISBN-13: 9784774141640
    const result = formatToIsbn13('477414164X')
    expect(result).toBe('9784774141640')
  })
})
