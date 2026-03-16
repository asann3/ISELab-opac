import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// テストリスト: fetchBookMetadata
// [ ] OpenBDからタイトル・著者・出版社・書影を取得できる
// [ ] NDLからNDCを取得できる
// [ ] OpenBD失敗時にGoogle Booksにフォールバックする
// [ ] 全API失敗時にnullを返す
// [ ] OpenBDとNDLの結果をマージして返す

import { fetchBookMetadata } from './bookMetadata'

describe('fetchBookMetadata', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('OpenBDからタイトル・著者・出版社・書影を取得できる', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            summary: {
              title: 'リーダブルコード',
              author: 'Dustin Boswell',
              publisher: 'オライリージャパン',
              cover: 'https://cover.openbd.jp/9784873115658.jpg',
            },
          },
        ]),
      ),
    )

    const result = await fetchBookMetadata('9784873115658')

    expect(result).toMatchObject({
      isbn13: '9784873115658',
      title: 'リーダブルコード',
      author: 'Dustin Boswell',
      publisher: 'オライリージャパン',
      thumbnailUrl: 'https://cover.openbd.jp/9784873115658.jpg',
    })
  })

  it('NDLからNDCを取得できる', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockImplementation(async (url) => {
      const urlStr = url.toString()
      if (urlStr.includes('openbd')) {
        return new Response(
          JSON.stringify([
            {
              summary: {
                title: 'リーダブルコード',
                author: 'Dustin Boswell',
                publisher: 'オライリージャパン',
                cover: '',
              },
            },
          ]),
        )
      }
      if (urlStr.includes('ndlsearch')) {
        return new Response(
          `<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
            <records><record><recordPacking>string</recordPacking><recordData>
              &lt;dcterms:subject rdf:resource="http://id.ndl.go.jp/class/ndc9/007.64"/&gt;
            </recordData></record></records>
          </searchRetrieveResponse>`,
        )
      }
      return new Response('', { status: 404 })
    })

    const result = await fetchBookMetadata('9784873115658')

    expect(result).toMatchObject({
      ndc: '007.64',
    })
  })

  it('全API失敗時にnullを返す', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockRejectedValue(new Error('Network error'))

    const result = await fetchBookMetadata('9784873115658')

    expect(result).toBeNull()
  })
})
