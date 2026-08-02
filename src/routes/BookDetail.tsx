import { Link, useNavigate, useParams } from 'react-router-dom'
import { Cover } from '../components/Cover'
import { ProgressBar } from '../components/BookCard'
import { Shelf } from '../components/Shelf'
import {
  ChevronLeft,
  DownloadIcon,
  ExternalIcon,
  HeartIcon,
  PlayIcon,
} from '../components/icons'
import {
  formatPrice,
  getBook,
  getCategory,
  readingMinutes,
  relatedBooks,
} from '../data/catalog'
import type { BookFormat } from '../data/types'
import { useStore } from '../store'

const FORMAT_LABEL: Record<BookFormat, string> = {
  pdf: 'PDF',
  epub: 'EPUB',
  print: 'เล่มพิมพ์',
  audio: 'เสียงอ่าน',
}

export function BookDetail() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const book = getBook(slug)
  const { isSaved, toggleSaved, progress } = useStore()

  if (!book) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="font-semibold">ไม่พบหนังสือเล่มนี้</p>
        <Link to="/browse" className="btn btn-primary">
          กลับไปค้นหา
        </Link>
      </div>
    )
  }

  const category = getCategory(book.category)
  const entry = progress[book.slug]
  const saved = isSaved(book.slug)

  return (
    <div className="space-y-8 py-4 sm:px-4 lg:py-8">
      <div className="px-4 sm:px-0">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
          <ChevronLeft className="h-4 w-4" />
          ย้อนกลับ
        </button>
      </div>

      <div className="flex flex-col gap-6 px-4 sm:flex-row sm:px-0">
        <Cover book={book} className="w-36 shrink-0 self-center sm:w-48 sm:self-start" />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1">
            <Link
              to={`/browse?cat=${book.category}`}
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'var(--app-accent)' }}
            >
              {category?.name}
            </Link>
            <h1 className="text-2xl leading-tight font-bold">{book.title}</h1>
            {book.subtitle && <p className="muted">{book.subtitle}</p>}
          </div>

          <dl className="muted flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <div className="flex gap-1">
              <dt className="sr-only">ผู้เขียน</dt>
              <dd>{book.author}</dd>
            </div>
            {book.year && (
              <div className="flex gap-1">
                <dt className="sr-only">ปี</dt>
                <dd>{book.year}</dd>
              </div>
            )}
            {book.pages && (
              <div className="flex gap-1">
                <dt className="sr-only">จำนวนหน้า</dt>
                <dd>{book.pages} หน้า</dd>
              </div>
            )}
            <div className="flex gap-1">
              <dt className="sr-only">เวลาอ่านโดยประมาณ</dt>
              <dd>~{readingMinutes(book)} นาที (ตัวอย่างในแอป)</dd>
            </div>
            <div className="flex gap-1">
              <dt className="sr-only">ราคา</dt>
              <dd className="font-semibold" style={{ color: 'var(--app-accent)' }}>
                {formatPrice(book.price)}
              </dd>
            </div>
          </dl>

          {entry && !entry.finished && (
            <div className="space-y-1">
              <p className="muted text-xs">อ่านแล้ว {Math.round(entry.percent * 100)}%</p>
              <ProgressBar percent={entry.percent} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link to={`/read/${book.slug}`} className="btn btn-primary">
              <PlayIcon className="h-4 w-4" />
              {entry ? 'อ่านต่อ' : 'เริ่มอ่าน'}
            </Link>
            <button
              type="button"
              onClick={() => toggleSaved(book.slug)}
              className="btn btn-ghost"
              aria-pressed={saved}
            >
              <HeartIcon filled={saved} className="h-4 w-4" />
              {saved ? 'บันทึกแล้ว' : 'บันทึก'}
            </button>
            {book.downloadUrl && (
              <a
                href={book.downloadUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-ghost"
              >
                <DownloadIcon className="h-4 w-4" />
                ดาวน์โหลด
              </a>
            )}
            <a
              href={book.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-ghost"
            >
              <ExternalIcon className="h-4 w-4" />
              เปิดในเว็บไซต์
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            {book.formats.map((f) => (
              <span key={f} className="chip">
                {FORMAT_LABEL[f]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="space-y-2 px-4 sm:px-0">
        <h2 className="text-lg font-bold">เกี่ยวกับหนังสือเล่มนี้</h2>
        <p className="text-sm leading-relaxed">{book.summary}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {book.tags.map((tag) => (
            <Link key={tag} to={`/browse?q=${encodeURIComponent(tag)}`} className="chip">
              #{tag}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3 px-4 sm:px-0">
        <h2 className="text-lg font-bold">สารบัญ</h2>
        <ol className="surface divide-y overflow-hidden rounded-2xl">
          {book.chapters.map((chapter, index) => (
            <li key={chapter.id} style={{ borderColor: 'var(--app-border)' }}>
              <Link
                to={`/read/${book.slug}?ch=${index}`}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <span className="muted w-6 shrink-0 tabular-nums">{index + 1}</span>
                <span className="min-w-0 flex-1">{chapter.title}</span>
                {entry && entry.chapterIndex === index && (
                  <span
                    className="shrink-0 text-xs font-semibold"
                    style={{ color: 'var(--app-accent)' }}
                  >
                    ค้างไว้
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <Shelf title="เล่มที่เกี่ยวข้อง" books={relatedBooks(book)} />
    </div>
  )
}
