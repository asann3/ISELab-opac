import type { BookRecord, ISBN13 } from '@/types/book'

export async function fetchBookMetadata(
  isbn13: ISBN13,
): Promise<BookRecord | null> {
  const openbd = await fetchFromOpenBD(isbn13)
  const ndcResult = await fetchNdcFromNDL(isbn13)
  const ndc = ndcResult?.code ?? null
  const ndcEdition = ndcResult?.edition ?? null

  if (openbd) {
    let thumbnailUrl = openbd.cover || null
    if (thumbnailUrl) {
      thumbnailUrl = (await isUrlReachable(thumbnailUrl)) ? thumbnailUrl : null
    }
    if (!thumbnailUrl) {
      const googleBooks = await fetchFromGoogleBooks(isbn13)
      thumbnailUrl = googleBooks?.imageLinks?.thumbnail ?? null
    }
    return {
      isbn13,
      title: openbd.title,
      author: openbd.author || null,
      publisher: openbd.publisher || null,
      ndc,
      ndcEdition,
      thumbnailUrl,
      createdAt: new Date().toISOString(),
    }
  }

  const googleBooks = await fetchFromGoogleBooks(isbn13)
  if (googleBooks) {
    return {
      isbn13,
      title: googleBooks.title,
      author: googleBooks.authors?.[0] ?? null,
      publisher: googleBooks.publisher ?? null,
      ndc,
      ndcEdition,
      thumbnailUrl: googleBooks.imageLinks?.thumbnail ?? null,
      createdAt: new Date().toISOString(),
    }
  }

  return null
}

async function fetchFromOpenBD(isbn13: string) {
  try {
    const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn13}`)
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

async function fetchFromGoogleBooks(isbn13: string) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`,
    )
    const data = await res.json()
    if (!data?.items?.[0]?.volumeInfo) {
      return null
    }
    const info = data.items[0].volumeInfo as {
      title: string
      authors?: string[]
      publisher?: string
      imageLinks?: { thumbnail?: string }
    }
    // Google Books は http:// を返すが HTTPS ページで blocked になるため強制変換
    if (info.imageLinks?.thumbnail) {
      info.imageLinks.thumbnail = info.imageLinks.thumbnail.replace(
        /^http:\/\//,
        'https://',
      )
    }
    return info
  } catch {
    return null
  }
}

async function isUrlReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

async function fetchNdcFromNDL(
  isbn13: string,
): Promise<{ code: string; edition: 9 | 10 } | null> {
  try {
    const res = await fetch(
      `https://ndlsearch.ndl.go.jp/api/sru?operation=searchRetrieve&query=isbn%3D${isbn13}&recordSchema=dcndl`,
    )
    const xml = await res.text()
    const matches = [...xml.matchAll(/ndc(\d+)\/([0-9.]+)/g)]
    const ndc10 = matches.find((m) => m[1] === '10')
    if (ndc10) return { code: ndc10[2], edition: 10 }
    const ndc9 = matches.find((m) => m[1] === '9')
    if (ndc9) return { code: ndc9[2], edition: 9 }
    return null
  } catch {
    return null
  }
}
