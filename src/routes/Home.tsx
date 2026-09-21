import { Link } from 'react-router-dom'
import { Shelf } from '../components/Shelf'
import { ProgressBar } from '../components/BookCard'
import { Cover } from '../components/Cover'
import { PlayIcon } from '../components/icons'
import {
  books,
  categories,
  featuredBooks,
  freeBooks,
  getBook,
  ministry,
  newestBooks,
} from '../data/catalog'
import { useStore } from '../store'
import type { Progress } from '../store'
import type { Book } from '../data/types'

interface InProgress {
  book: Book
  progress: Progress
}

export function Home() {
  const { progress } = useStore()

  const continueReading: InProgress[] = Object.entries(progress)
    .filter(([, p]) => !p.finished)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .flatMap(([slug, p]) => {
      const book = getBook(slug)
      return book ? [{ book, progress: p }] : []
    })
    .slice(0, 4)

  const hero = featuredBooks[0] ?? books[0]

  return (
    <div className="space-y-9 py-4 sm:px-4 lg:py-8">
      {hero && <Hero slug={hero.slug} />}

      {continueReading.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-4 text-lg font-bold sm:px-0">อ่านต่อ</h2>
          <div className="grid gap-3 px-4 sm:grid-cols-2 sm:px-0">
            {continueReading.map(({ book, progress: p }) => (
              <Link
                key={book.id}
                to={`/read/${book.slug}`}
                className="surface flex items-center gap-3 rounded-2xl p-3"
              >
                <Cover book={book} bare className="w-14 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate text-sm font-semibold">{book.title}</p>
                  <p className="muted text-xs">
                    {book.chapters[p.chapterIndex]?.title ?? 'เริ่มอ่าน'}
                  </p>
                  <ProgressBar percent={p.percent} />
                </div>
                <PlayIcon className="h-5 w-5 shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="px-4 text-lg font-bold sm:px-0">หมวดหมู่</h2>
        <div className="grid grid-cols-2 gap-3 px-4 sm:px-0 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/browse?cat=${category.id}`}
              className="rounded-2xl p-4 text-white transition-transform hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, hsl(${category.hue} 45% 34%), hsl(${
                  (category.hue + 30) % 360
                } 40% 24%))`,
              }}
            >
              <p className="text-base font-bold">{category.name}</p>
              <p className="mt-1 text-xs opacity-80">{category.blurb}</p>
              <p className="mt-3 text-[0.68rem] opacity-70">
                {books.filter((b) => b.category === category.id).length} เล่ม
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Shelf
        title="หนังสือแนะนำ"
        subtitle="คัดมาสำหรับผู้เริ่มต้น"
        books={featuredBooks}
        moreHref="/browse"
      />

      <Shelf
        title="ดาวน์โหลดฟรี"
        subtitle={`${freeBooks.length} เล่มที่พันธกิจแจกฟรี`}
        books={freeBooks}
        moreHref="/browse?free=1"
      />

      <Shelf title="ออกใหม่" books={newestBooks.slice(0, 8)} moreHref="/browse" />

      <section className="px-4 sm:px-0">
        <div className="surface space-y-2 rounded-2xl p-5 text-sm">
          <h2 className="text-base font-bold">{ministry.name}</h2>
          <p className="muted">{ministry.tagline}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            <a
              href={ministry.website}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold"
              style={{ color: 'var(--app-accent)' }}
            >
              เว็บไซต์
            </a>
            <a
              href={ministry.facebook}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold"
              style={{ color: 'var(--app-accent)' }}
            >
              Facebook
            </a>
            <a
              href={ministry.youtube}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold"
              style={{ color: 'var(--app-accent)' }}
            >
              YouTube
            </a>
            <a href={`mailto:${ministry.email}`} className="muted">
              {ministry.email}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function Hero({ slug }: { slug: string }) {
  const book = getBook(slug)
  if (!book) return null

  return (
    <section className="px-4 sm:px-0">
      <div className="surface flex flex-col gap-5 rounded-3xl p-5 sm:flex-row sm:items-center sm:p-7">
        <Cover book={book} className="w-32 shrink-0 sm:w-40" />
        <div className="min-w-0 space-y-3">
          <p
            className="text-xs font-semibold tracking-[0.18em] uppercase"
            style={{ color: 'var(--app-accent)' }}
          >
            หนังสือของสัปดาห์นี้
          </p>
          <h2 className="text-2xl leading-tight font-bold">{book.title}</h2>
          {book.subtitle && <p className="muted text-sm">{book.subtitle}</p>}
          <p className="line-clamp-3 text-sm leading-relaxed">{book.summary}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link to={`/read/${book.slug}`} className="btn btn-primary">
              <PlayIcon className="h-4 w-4" />
              เริ่มอ่าน
            </Link>
            <Link to={`/book/${book.slug}`} className="btn btn-ghost">
              รายละเอียด
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
