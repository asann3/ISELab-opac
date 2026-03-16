import type { BookRecord, ISBN13 } from '@/types/book'

export async function fetchBookMetadata(
  isbn13: ISBN13,
): Promise<BookRecord | null> {
  const openbd = await fetchFromOpenBD(isbn13)
  if (!openbd) {
    return null
  }

  const ndc = await fetchNdcFromNDL(isbn13)

  return {
    isbn13: isbn13 as ISBN13,
    title: openbd.title,
    author: openbd.author ?? null,
    publisher: openbd.publisher ?? null,
    ndc,
    thumbnailUrl: openbd.cover ?? null,
    createdAt: new Date().toISOString(),
  }
}

async function fetchFromOpenBD(isbn13: string) {
  try {
    const res = await fetch(
      `https://api.openbd.jp/v1/get?isbn=${isbn13}`,
    )
    const data = await res.json()
    if (!data?.[0]?.summary) {
      return null
    }
    return data[0].summary as {
      title: string
      author: string
      publisher: string
      cover: string
    }
  } catch {
    return null
  }
}

async function fetchNdcFromNDL(isbn13: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://ndlsearch.ndl.go.jp/api/sru?operation=searchRetrieve&query=isbn%3D${isbn13}&recordSchema=dcndl`,
    )
    const xml = await res.text()
    const match = xml.match(/ndc9\/([0-9.]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
