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

async function fetchNdc(isbn: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://ndlsearch.ndl.go.jp/api/sru?operation=searchRetrieve&query=isbn%3D${isbn}&recordSchema=dcndl`,
    )
    const xml = await res.text()
    const match = xml.match(/ndc9\/([0-9.]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function fetchOpenBD(
  isbn: string,
): Promise<{ publisher: string; thumbnailUrl: string | null } | null> {
  try {
    const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`)
    const data = await res.json()
    const summary = data?.[0]?.summary
    if (!summary) return null
    return {
      publisher: summary.publisher || '',
      thumbnailUrl: summary.cover || null,
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
    range: `${sheetName}!A:G`,
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
    .filter(({ row }) => row[0] && (!row[3] || !row[4] || !row[5]))

  console.log(`対象: ${targets.length}件 / 全${rows.length - 1}件`)

  const updates: { range: string; values: string[][] }[] = []

  for (let i = 0; i < targets.length; i++) {
    const { row, rowIndex } = targets[i]
    const isbn = row[0]
    const needsPublisher = !row[3]
    const needsNdc = !row[4]
    const needsThumbnail = !row[5]

    let ndc: string | null = null
    let publisher: string | null = null
    let thumbnailUrl: string | null = null

    if (needsNdc) {
      ndc = await fetchNdc(isbn)
      await sleep(300)
    }
    if (needsPublisher || needsThumbnail) {
      const openbd = await fetchOpenBD(isbn)
      if (openbd) {
        publisher = openbd.publisher || null
        thumbnailUrl = openbd.thumbnailUrl
      }
      await sleep(200)
    }

    if (needsPublisher && publisher) {
      updates.push({
        range: `${sheetName}!D${rowIndex}`,
        values: [[publisher]],
      })
    }
    if (needsNdc && ndc) {
      updates.push({ range: `${sheetName}!E${rowIndex}`, values: [[ndc]] })
    }
    if (needsThumbnail && thumbnailUrl) {
      updates.push({
        range: `${sheetName}!F${rowIndex}`,
        values: [[thumbnailUrl]],
      })
    }

    const filled =
      [
        needsNdc && ndc ? `ndc:${ndc}` : null,
        needsPublisher && publisher ? `pub:${publisher}` : null,
        needsThumbnail && thumbnailUrl ? 'thumb:ok' : null,
      ]
        .filter(Boolean)
        .join(', ') || '取得不可'
    console.log(`[${i + 1}/${targets.length}] ${isbn} → ${filled}`)
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
