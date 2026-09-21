import { Link } from 'react-router-dom'
import { BookCard } from './BookCard'
import type { Book } from '../data/types'

interface Props {
  title: string
  subtitle?: string
  books: Book[]
  moreHref?: string
}

/** Horizontally scrolling row of covers — the primary browse affordance. */
export function Shelf({ title, subtitle, books, moreHref }: Props) {
  if (books.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 px-4 sm:px-0">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {subtitle && <p className="muted text-sm">{subtitle}</p>}
        </div>
        {moreHref && (
          <Link
            to={moreHref}
            className="shrink-0 text-sm font-semibold"
            style={{ color: 'var(--app-accent)' }}
          >
            ดูทั้งหมด
          </Link>
        )}
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 sm:px-0">
        {books.map((book) => (
          <BookCard key={book.id} book={book} width="9.5rem" />
        ))}
      </div>
    </section>
  )
}
