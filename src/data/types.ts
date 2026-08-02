export type CategoryId = 'family' | 'body' | 'mind' | 'spirit'

export interface Category {
  id: CategoryId
  /** Thai label, as used on rnrnewlife.com */
  name: string
  nameEn: string
  blurb: string
  /** Hue (0-360) used to tint generated covers and category headers. */
  hue: number
}

export interface Chapter {
  id: string
  title: string
  /** Paragraphs of body copy, in reading order. */
  body: string[]
}

export type BookFormat = 'pdf' | 'epub' | 'print' | 'audio'

export interface Book {
  id: string
  slug: string
  title: string
  subtitle?: string
  author: string
  category: CategoryId
  /** Publication year, when known. */
  year?: number
  /** Printed page count, when known. */
  pages?: number
  summary: string
  tags: string[]
  formats: BookFormat[]
  /** THB. 0 means the ministry offers it free. */
  price: number
  /** Canonical page on rnrnewlife.com for this title. */
  sourceUrl: string
  /** Direct file download, when the ministry publishes one. */
  downloadUrl?: string
  /** Cover artwork from the site; the app falls back to a generated cover. */
  coverUrl?: string
  featured?: boolean
  chapters: Chapter[]
}

export interface Catalog {
  /** Where the data came from, and when it was last refreshed. */
  source: {
    site: string
    bookIndex: string
    /** ISO date, or null when the catalog has never been synced. */
    syncedAt: string | null
    /** True while the app is running on hand-written seed content. */
    placeholder: boolean
    note: string
  }
  ministry: {
    name: string
    nameEn: string
    tagline: string
    email: string
    phone: string
    website: string
    facebook: string
    youtube: string
  }
  categories: Category[]
  books: Book[]
}
