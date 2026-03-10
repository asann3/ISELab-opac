import { describe, it, expect } from 'vitest'
import { formatToIsbn13 } from './isbn'

describe('formatToIsbn13', () => {
  it('ハイフン付きISBN-13を正規化できる', () => {
    const result = formatToIsbn13('978-4-274-21788-6')
    expect(result).toBe('9784274217886')
  })
})
