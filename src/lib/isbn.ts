import type { ISBN13 } from '@/types/book'

export function formatToIsbn13(raw: string): ISBN13 {
  const stripped = raw.replace(/[-\s]/g, '')

  if (!/^(\d{10}|\d{9}X|\d{13})$/.test(stripped)) {
    throw new Error(`Invalid ISBN: "${raw}"`)
  }

  if (stripped.length === 10) {
    const isbn13Body = `978${stripped.slice(0, 9)}`
    const checkDigit = calculateCheckDigit(isbn13Body)
    return `${isbn13Body}${checkDigit}` as ISBN13
  }

  return stripped as ISBN13
}

function calculateCheckDigit(isbn13Body: string): number {
  const sum = isbn13Body
    .split('')
    .reduce(
      (acc, digit, i) => acc + Number(digit) * (i % 2 === 0 ? 1 : 3),
      0,
    )
  const remainder = sum % 10
  return remainder === 0 ? 0 : 10 - remainder
}
