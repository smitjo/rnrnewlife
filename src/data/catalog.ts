import raw from './catalog.json'
import type { Book, Catalog, Category, CategoryId } from './types'

/**
 * The catalog ships as JSON so `npm run sync:catalog` can regenerate it from
 * rnrnewlife.com without touching any application code.
 */
export const catalog = raw as Catalog

export const { ministry, source } = catalog
export const categories: Category[] = catalog.categories
export const books: Book[] = catalog.books

const bySlug = new Map(books.map((b) => [b.slug, b]))
const byCategory = new Map<CategoryId, Category>(categories.map((c) => [c.id, c]))

export function getBook(slug: string): Book | undefined {
  return bySlug.get(slug)
}

export function getCategory(id: CategoryId): Category | undefined {
  return byCategory.get(id)
}

export function booksIn(id: CategoryId): Book[] {
  return books.filter((b) => b.category === id)
}

export const featuredBooks = books.filter((b) => b.featured)

export const freeBooks = books.filter((b) => b.price === 0)

export const newestBooks = [...books].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))

export type SortKey = 'newest' | 'title' | 'shortest'

export interface SearchOptions {
  query?: string
  category?: CategoryId | 'all'
  freeOnly?: boolean
  sort?: SortKey
}

/** Matches title, subtitle, author, summary and tags — accent/case insensitive. */
export function searchBooks({
  query = '',
  category = 'all',
  freeOnly = false,
  sort = 'newest',
}: SearchOptions): Book[] {
  const q = query.trim().toLowerCase()

  let result = books.filter((book) => {
    if (category !== 'all' && book.category !== category) return false
    if (freeOnly && book.price !== 0) return false
    if (!q) return true

    const haystack = [book.title, book.subtitle ?? '', book.author, book.summary, ...book.tags]
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })

  result = [...result]
  switch (sort) {
    case 'title':
      result.sort((a, b) => a.title.localeCompare(b.title, 'th'))
      break
    case 'shortest':
      result.sort((a, b) => (a.pages ?? Infinity) - (b.pages ?? Infinity))
      break
    case 'newest':
    default:
      result.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
  }

  return result
}

/** Same category first, then anything sharing a tag. */
export function relatedBooks(book: Book, limit = 4): Book[] {
  const scored = books
    .filter((b) => b.id !== book.id)
    .map((b) => {
      const sharedTags = b.tags.filter((t) => book.tags.includes(t)).length
      return { book: b, score: (b.category === book.category ? 2 : 0) + sharedTags }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((entry) => entry.book)
}

export function totalParagraphs(book: Book): number {
  return book.chapters.reduce((sum, ch) => sum + ch.body.length, 0)
}

/** Rough reading time at ~180 Thai words per minute. */
export function readingMinutes(book: Book): number {
  const words = book.chapters.reduce(
    (sum, ch) => sum + ch.body.reduce((n, p) => n + p.length / 4, 0),
    0,
  )
  return Math.max(1, Math.round(words / 180))
}

export function formatPrice(price: number): string {
  return price === 0 ? 'ฟรี' : `${price.toLocaleString('th-TH')} บาท`
}
