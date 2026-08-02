import { Link } from 'react-router-dom'
import { useState } from 'react'
import { BookCard, ProgressBar } from '../components/BookCard'
import { Cover } from '../components/Cover'
import { BookmarkIcon, CloseIcon } from '../components/icons'
import { getBook } from '../data/catalog'
import { useStore } from '../store'
import type { Book } from '../data/types'
import type { Progress } from '../store'

type Tab = 'reading' | 'saved' | 'finished' | 'bookmarks'

const TABS: { id: Tab; label: string }[] = [
  { id: 'reading', label: 'กำลังอ่าน' },
  { id: 'saved', label: 'บันทึกไว้' },
  { id: 'finished', label: 'อ่านจบแล้ว' },
  { id: 'bookmarks', label: 'ที่คั่นหน้า' },
]

export function Library() {
  const { saved, progress, bookmarks, removeBookmark } = useStore()
  const [tab, setTab] = useState<Tab>('reading')

  const entries = Object.entries(progress)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .flatMap(([slug, p]): { book: Book; progress: Progress }[] => {
      const book = getBook(slug)
      return book ? [{ book, progress: p }] : []
    })

  const reading = entries.filter((e) => !e.progress.finished)
  const finished = entries.filter((e) => e.progress.finished)
  const savedBooks = saved.flatMap((slug) => {
    const book = getBook(slug)
    return book ? [book] : []
  })

  return (
    <div className="space-y-5 py-4 sm:px-4 lg:py-8">
      <h1 className="px-4 text-xl font-bold sm:px-0">ชั้นหนังสือของฉัน</h1>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="chip"
            data-active={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reading' &&
        (reading.length === 0 ? (
          <Empty text="ยังไม่มีเล่มที่กำลังอ่าน" />
        ) : (
          <div className="grid gap-3 px-4 sm:grid-cols-2 sm:px-0">
            {reading.map(({ book, progress: p }) => (
              <Link
                key={book.id}
                to={`/read/${book.slug}?ch=${p.chapterIndex}`}
                className="surface flex items-center gap-3 rounded-2xl p-3"
              >
                <Cover book={book} bare className="w-14 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate text-sm font-semibold">{book.title}</p>
                  <p className="muted text-xs">
                    {book.chapters[p.chapterIndex]?.title} · {Math.round(p.percent * 100)}%
                  </p>
                  <ProgressBar percent={p.percent} />
                </div>
              </Link>
            ))}
          </div>
        ))}

      {tab === 'saved' &&
        (savedBooks.length === 0 ? (
          <Empty text="ยังไม่มีเล่มที่บันทึกไว้ กดรูปหัวใจในหน้าหนังสือเพื่อบันทึก" />
        ) : (
          <Grid books={savedBooks} />
        ))}

      {tab === 'finished' &&
        (finished.length === 0 ? (
          <Empty text="ยังไม่มีเล่มที่อ่านจบ" />
        ) : (
          <Grid books={finished.map((e) => e.book)} />
        ))}

      {tab === 'bookmarks' &&
        (bookmarks.length === 0 ? (
          <Empty text="ยังไม่มีที่คั่นหน้า กดไอคอนคั่นหน้าระหว่างอ่านเพื่อบันทึกจุดที่อ่านค้างไว้" />
        ) : (
          <ul className="space-y-2 px-4 sm:px-0">
            {bookmarks.map((bookmark) => {
              const book = getBook(bookmark.bookSlug)
              if (!book) return null
              return (
                <li key={bookmark.createdAt} className="surface flex items-center gap-3 rounded-2xl p-3">
                  <BookmarkIcon filled className="h-5 w-5 shrink-0" />
                  <Link
                    to={`/read/${book.slug}?ch=${bookmark.chapterIndex}`}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-sm font-semibold">{book.title}</p>
                    <p className="muted truncate text-xs">{bookmark.excerpt}</p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeBookmark(bookmark.createdAt)}
                    className="muted rounded-full p-1.5"
                    aria-label="ลบที่คั่นหน้า"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        ))}
    </div>
  )
}

function Grid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-4 sm:grid-cols-3 sm:px-0 lg:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="px-4 py-12 text-center sm:px-0">
      <p className="muted text-sm">{text}</p>
      <Link to="/browse" className="btn btn-primary mt-4">
        เลือกหนังสือ
      </Link>
    </div>
  )
}
