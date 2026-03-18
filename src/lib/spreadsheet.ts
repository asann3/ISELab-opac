import { google } from 'googleapis'
import type { BookRecord, ISBN13 } from '@/types/book'

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

export async function getAllBooks(): Promise<BookRecord[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:G`,
  })

  const rows = res.data.values
  if (!rows || rows.length <= 1) {
    return []
  }

  const seen = new Set<string>()
  return rows
    .slice(1)
    .filter((row) => {
      if (!row[0] || seen.has(row[0])) return false
      seen.add(row[0])
      return true
    })
    .map((row) => ({
      isbn13: row[0] as ISBN13,
      title: row[1],
      author: row[2] || null,
      publisher: row[3] || null,
      ndc: row[4] || null,
      thumbnailUrl: row[5] || null,
      createdAt: row[6],
    }))
}

export class DuplicateIsbnError extends Error {
  constructor(isbn13: string) {
    super(`ISBN ${isbn13} is already registered`)
    this.name = 'DuplicateIsbnError'
  }
}

export async function saveBookToSpreadsheet(book: BookRecord): Promise<void> {
  const existing = await getAllBooks()
  if (existing.some((b) => b.isbn13 === book.isbn13)) {
    throw new DuplicateIsbnError(book.isbn13)
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:G`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        [
          book.isbn13,
          book.title,
          book.author ?? '',
          book.publisher ?? '',
          book.ndc ?? '',
          book.thumbnailUrl ?? '',
          book.createdAt,
        ],
      ],
    },
  })
}
