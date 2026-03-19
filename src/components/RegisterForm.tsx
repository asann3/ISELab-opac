'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import type { BookRecord } from '@/types/book'
import { BarcodeScanner } from './BarcodeScanner'

type Phase = 'input' | 'preview' | 'manual'

export function RegisterForm() {
  const [isbn, setIsbn] = useState('')
  const [book, setBook] = useState<BookRecord | null>(null)
  const [phase, setPhase] = useState<Phase>('input')
  const [loading, setLoading] = useState(false)
  const [manualIsbn, setManualIsbn] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [manualAuthor, setManualAuthor] = useState('')
  const [manualPublisher, setManualPublisher] = useState('')

  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const isSearchingRef = useRef(false)

  const searchByIsbn = useCallback(async (isbnValue: string) => {
    if (!isbnValue) return
    isSearchingRef.current = true
    setLoading(true)
    try {
      const res = await fetch(
        `/api/books/metadata?isbn=${encodeURIComponent(isbnValue)}`,
      )
      if (res.ok) {
        const data = await res.json()
        if (data.book) {
          setBook(data.book)
          setPhase('preview')
        } else {
          setManualIsbn(isbnValue)
          setPhase('manual')
        }
      } else {
        setManualIsbn(isbnValue)
        setPhase('manual')
      }
    } catch {
      setManualIsbn(isbnValue)
      setPhase('manual')
    } finally {
      setLoading(false)
      isSearchingRef.current = false
    }
  }, [])

  const handleScan = useCallback(
    (scanned: string) => {
      if (phaseRef.current !== 'input') return
      if (isSearchingRef.current) return
      setIsbn(scanned)
      void searchByIsbn(scanned)
    },
    [searchByIsbn],
  )

  function handleSearch() {
    void searchByIsbn(isbn)
  }

  function resetToInput() {
    setBook(null)
    setPhase('input')
  }

  async function handleRegister() {
    if (!book) {
      const digits = manualIsbn.replace(/[-\s]/g, '')
      if (!/^\d{10}$|^\d{13}$/.test(digits)) {
        toast.error('ISBNは10桁または13桁の数字で入力してください')
        return
      }
    }

    const payload = book ?? {
      isbn13: manualIsbn,
      title: manualTitle,
      author: manualAuthor || null,
      publisher: manualPublisher || null,
      ndc: null,
      thumbnailUrl: null,
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 409) {
        toast.error('すでに登録されています')
        return
      }
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? '登録に失敗しました')
        return
      }

      toast.success('登録しました')
      setIsbn('')
      setBook(null)
      setPhase('input')
    } catch {
      toast.error('登録に失敗しました')
    }
  }

  const cameraVisible = phase === 'input' && !loading

  return (
    <div className="flex flex-col gap-3">
      {/* カメラは常にマウント・動作させ、CSSで表示/非表示を切り替える（start/stopを繰り返さない） */}
      <div className={cameraVisible ? undefined : 'hidden'}>
        <BarcodeScanner onScan={handleScan} />
      </div>

      {phase === 'input' && (
        <div className="flex gap-2">
          <Input
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="ISBNを入力"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          >
            {loading ? '検索中…' : '検索'}
          </button>
        </div>
      )}

      {loading && phase === 'input' && (
        <p className="text-center text-sm text-muted-foreground">検索中…</p>
      )}

      {phase === 'preview' && book && (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <button
            type="button"
            onClick={resetToInput}
            className="self-start text-xs text-muted-foreground underline"
          >
            ← もう一度スキャン
          </button>
          <div className="flex gap-3">
            {book.thumbnailUrl && (
              <img
                src={book.thumbnailUrl}
                alt={book.title}
                className="h-24 w-16 flex-shrink-0 rounded object-cover shadow"
              />
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <div className="font-semibold leading-snug">{book.title}</div>
              {book.author && (
                <div className="text-sm text-muted-foreground">
                  {book.author}
                </div>
              )}
              {book.publisher && (
                <div className="text-sm text-muted-foreground">
                  {book.publisher}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRegister}
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
          >
            登録
          </button>
        </div>
      )}

      {phase === 'manual' && (
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          <button
            type="button"
            onClick={resetToInput}
            className="self-start text-xs text-muted-foreground underline"
          >
            ← もう一度スキャン
          </button>
          <p className="text-sm text-muted-foreground">
            書誌情報が取得できませんでした。手入力してください。
          </p>
          <Input
            value={manualIsbn}
            onChange={(e) => setManualIsbn(e.target.value)}
            placeholder="ISBN"
          />
          <Input
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder="タイトル"
          />
          <Input
            value={manualAuthor}
            onChange={(e) => setManualAuthor(e.target.value)}
            placeholder="著者名"
          />
          <Input
            value={manualPublisher}
            onChange={(e) => setManualPublisher(e.target.value)}
            placeholder="出版社"
          />
          <button
            type="button"
            onClick={handleRegister}
            className="mt-1 rounded-md bg-foreground px-4 py-2 text-sm text-background"
          >
            登録
          </button>
        </div>
      )}
    </div>
  )
}
