import { useState } from 'react'
import { getCategory } from '../data/catalog'
import type { Book } from '../data/types'

/**
 * Covers are generated rather than fetched: the ministry's artwork lives behind
 * rnrnewlife.com and the app has to stay usable offline. Each cover is derived
 * deterministically from the book id, so a title always looks the same.
 */
function hash(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

interface Props {
  book: Book
  className?: string
  /** Hides the title text for small decorative uses. */
  bare?: boolean
}

export function Cover({ book, className = '', bare = false }: Props) {
  const [artworkFailed, setArtworkFailed] = useState(false)
  const hue = getCategory(book.category)?.hue ?? 170
  const seed = hash(book.id)
  const angle = seed % 60
  const arcs = 3 + (seed % 3)

  // Once the catalog has been synced, real artwork is available and wins.
  if (book.coverUrl && !artworkFailed) {
    return (
      <img
        src={book.coverUrl}
        alt={`ปกหนังสือ ${book.title}`}
        loading="lazy"
        onError={() => setArtworkFailed(true)}
        className={`rounded-xl object-cover ${className}`}
        style={{ aspectRatio: '2 / 3', boxShadow: '0 10px 30px -12px rgb(0 0 0 / 0.45)' }}
      />
    )
  }

  return (
    <div
      className={`relative isolate overflow-hidden rounded-xl ${className}`}
      style={{
        aspectRatio: '2 / 3',
        background: `linear-gradient(${140 + angle}deg,
          hsl(${hue} 42% 32%) 0%,
          hsl(${(hue + 28) % 360} 38% 22%) 100%)`,
        boxShadow: '0 10px 30px -12px rgb(0 0 0 / 0.45)',
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-45"
        viewBox="0 0 120 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {Array.from({ length: arcs }).map((_, i) => (
          <circle
            key={i}
            cx={20 + ((seed >> (i * 3)) % 90)}
            cy={30 + ((seed >> (i * 5)) % 120)}
            r={26 + i * 16}
            fill="none"
            stroke={`hsl(${(hue + i * 24) % 360} 70% 72%)`}
            strokeWidth="0.8"
          />
        ))}
        <path
          d={`M0 ${120 + (seed % 30)} Q 60 ${70 + (seed % 40)} 120 ${140 - (seed % 40)}`}
          fill="none"
          stroke={`hsl(${hue} 80% 78%)`}
          strokeWidth="1.2"
        />
      </svg>

      {/* Spine highlight */}
      <div
        className="absolute inset-y-0 left-0 w-[7%]"
        style={{ background: 'linear-gradient(90deg, rgb(0 0 0 / 0.35), transparent)' }}
        aria-hidden="true"
      />

      {!bare && (
        <div className="absolute inset-0 flex flex-col justify-between p-3 text-white">
          <span className="text-[0.6rem] font-semibold tracking-wide opacity-80">
            {getCategory(book.category)?.name}
          </span>
          <div>
            <p className="text-sm leading-snug font-bold drop-shadow-sm">{book.title}</p>
            {book.subtitle && (
              <p className="mt-1 line-clamp-2 text-[0.65rem] leading-tight opacity-80">
                {book.subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
