/**
 * メタデータバックフィルスクリプト
 * NDC・publisher・thumbnailUrlが空の本をAPIから取得して埋める
 * 使い方: npx tsx scripts/backfill-metadata.ts
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { google } from 'googleapis'

// .env.local を読み込む
const envPath = resolve(process.cwd(), '.env.local')
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key?.trim() && rest.length) {
    const value = rest
      .join('=')
      .trim()
      .replace(/^"|"$/g, '')
      .replace(/\\n/g, '\n')
    process.env[key.trim()] = value
  }
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })
const spreadsheetId = process.env.SPREADSHEET_ID ?? ''
const sheetName = process.env.SHEET_NAME ?? 'Books'

async function fetchNdc(
  isbn: string,
): Promise<{ code: string; edition: 9 | 10 } | null> {
  try {
    const res = await fetch(
      `https://ndlsearch.ndl.go.jp/api/sru?operation=searchRetrieve&query=isbn%3D${isbn}&recordSchema=dcndl`,
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

async function fetchOpenBD(
  isbn: string,
): Promise<{ publisher: string | null; thumbnailUrl: string | null } | null> {
  try {
    const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`)
    const data = await res.json()
    const summary = data?.[0]?.summary
    if (!summary) return null
    return {
      publisher: summary.publisher || null,
      thumbnailUrl: summary.cover || null,
    }
  } catch {
    return null
  }
}

async function fetchGoogleBooks(
  isbn: string,
): Promise<{ publisher: string | null; thumbnailUrl: string | null } | null> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    const keyParam = apiKey ? `&key=${apiKey}` : ''
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${keyParam}`,
    )
    const data = await res.json()
    const info = data?.items?.[0]?.volumeInfo
    if (!info) return null
    const thumbnail = info.imageLinks?.thumbnail
    return {
      publisher: info.publisher || null,
      thumbnailUrl: thumbnail
        ? thumbnail.replace(/^http:\/\//, 'https://')
        : null,
    }
  } catch {
    return null
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:H`,
  })

  const rows = res.data.values
  if (!rows || rows.length <= 1) {
    console.log('データなし')
    return
  }

  // 対象: NDC・publisher・thumbnailUrlのいずれかが空の行
  const targets = rows
    .slice(1)
    .map((row, i) => ({ row, rowIndex: i + 2 }))
    .filter(({ row }) => row[0] && (!row[3] || !row[4] || !row[6]))

  console.log(`対象: ${targets.length}件 / 全${rows.length - 1}件`)

  const updates: { range: string; values: string[][] }[] = []

  for (let i = 0; i < targets.length; i++) {
    const { row, rowIndex } = targets[i]
    const isbn = row[0]
    const needsPublisher = !row[3]
    const needsNdc = !row[4]
    const needsThumbnail = !row[6]

    const filled: string[] = []

    if (needsNdc) {
      const ndcResult = await fetchNdc(isbn)
      if (ndcResult) {
        updates.push({
          range: `${sheetName}!E${rowIndex}`,
          values: [[ndcResult.code]],
        })
        updates.push({
          range: `${sheetName}!F${rowIndex}`,
          values: [[String(ndcResult.edition)]],
        })
        filled.push(`ndc:${ndcResult.code}(${ndcResult.edition})`)
      }
      await sleep(300)
    }

    if (needsPublisher || needsThumbnail) {
      const openbd = await fetchOpenBD(isbn)
      const googleBooks =
        (needsPublisher && !openbd?.publisher) ||
        (!openbd?.thumbnailUrl && needsThumbnail)
          ? await fetchGoogleBooks(isbn)
          : null
      if (needsPublisher) {
        const publisher = openbd?.publisher ?? googleBooks?.publisher ?? null
        if (publisher) {
          updates.push({
            range: `${sheetName}!D${rowIndex}`,
            values: [[publisher]],
          })
          filled.push(`pub:${publisher}`)
        }
      }
      if (needsThumbnail) {
        const thumbnailUrl =
          openbd?.thumbnailUrl ?? googleBooks?.thumbnailUrl ?? null
        if (thumbnailUrl) {
          updates.push({
            range: `${sheetName}!G${rowIndex}`,
            values: [[thumbnailUrl]],
          })
          filled.push('thumb:ok')
        }
      }
      await sleep(200)
    }

    console.log(
      `[${i + 1}/${targets.length}] ${isbn} → ${filled.join(', ') || '取得不可'}`,
    )
  }

  if (updates.length > 0) {
    // 100件ずつバッチ更新
    for (let i = 0; i < updates.length; i += 100) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates.slice(i, i + 100),
        },
      })
    }
    console.log(`\n完了: ${updates.length}セル更新`)
  } else {
    console.log('\n更新なし')
  }
}

main().catch(console.error)
