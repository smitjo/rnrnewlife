import { Link } from 'react-router-dom'
import { Cover } from './Cover'
import { formatPrice, getCategory } from '../data/catalog'
import type { Book } from '../data/types'
import { useStore } from '../store'

export function ProgressBar({ percent }: { percent: number }) {
  const value = Math.round(percent * 100)
  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full"
      style={{ background: 'var(--app-surface-2)' }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`อ่านแล้ว ${value}%`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${value}%`, background: 'var(--app-accent)' }}
      />
    </div>
  )
}

interface Props {
  book: Book
  /** Fixed width for horizontal shelves; omit inside grids. */
  width?: string
  showProgress?: boolean
}

export function BookCard({ book, width, showProgress = true }: Props) {
  const { progress } = useStore()
  const entry = progress[book.slug]
  const category = getCategory(book.category)

  return (
    <Link
      to={`/book/${book.slug}`}
      className="group block shrink-0"
      style={width ? { width } : undefined}
    >
      <Cover book={book} className="transition-transform duration-200 group-hover:-translate-y-1" />
      <div className="mt-2 space-y-1">
        <p className="line-clamp-2 text-sm leading-snug font-semibold">{book.title}</p>
        <p className="muted text-xs">
          {category?.name} · {formatPrice(book.price)}
        </p>
        {showProgress && entry && !entry.finished && <ProgressBar percent={entry.percent} />}
        {showProgress && entry?.finished && (
          <p className="text-xs font-medium" style={{ color: 'var(--app-accent)' }}>
            อ่านจบแล้ว
          </p>
        )}
      </div>
    </Link>
  )
}
