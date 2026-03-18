'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import type { BookRecord } from '@/types/book'

type Phase = 'input' | 'preview' | 'manual'

export function RegisterForm() {
  const [isbn, setIsbn] = useState('')
  const [book, setBook] = useState<BookRecord | null>(null)
  const [phase, setPhase] = useState<Phase>('input')
  const [loading, setLoading] = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [manualAuthor, setManualAuthor] = useState('')
  const [manualPublisher, setManualPublisher] = useState('')

  async function handleSearch() {
    if (!isbn) return
    setLoading(true)
    try {
      const res = await fetch(`/api/books/metadata?isbn=${encodeURIComponent(isbn)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.book) {
          setBook(data.book)
          setPhase('preview')
        } else {
          setPhase('manual')
        }
      } else {
        setPhase('manual')
      }
    } catch {
      setPhase('manual')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    const payload = book ?? {
      isbn13: isbn,
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder="ISBNを入力"
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

      {phase === 'preview' && book && (
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          <div className="font-semibold">{book.title}</div>
          {book.author && <div className="text-sm text-muted-foreground">{book.author}</div>}
          {book.publisher && <div className="text-sm text-muted-foreground">{book.publisher}</div>}
          {book.thumbnailUrl && (
            <img src={book.thumbnailUrl} alt={book.title} className="h-24 w-16 object-cover" />
          )}
          <button
            type="button"
            onClick={handleRegister}
            className="mt-2 rounded-md bg-foreground px-4 py-2 text-sm text-background"
          >
            登録
          </button>
        </div>
      )}

      {phase === 'manual' && (
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">書誌情報が取得できませんでした。手入力してください。</p>
          <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="タイトル" />
          <Input value={manualAuthor} onChange={(e) => setManualAuthor(e.target.value)} placeholder="著者名" />
          <Input value={manualPublisher} onChange={(e) => setManualPublisher(e.target.value)} placeholder="出版社" />
          <button
            type="button"
            onClick={handleRegister}
            className="mt-2 rounded-md bg-foreground px-4 py-2 text-sm text-background"
          >
            登録
          </button>
        </div>
      )}
    </div>
  )
}
