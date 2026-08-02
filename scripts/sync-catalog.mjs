#!/usr/bin/env node
/**
 * Rebuilds src/data/catalog.json from https://rnrnewlife.com/book/.
 *
 * The app ships with hand-written seed data because the site is not reachable
 * from every environment (this repo's CI sandbox blocks the domain outright).
 * Run this from a machine that can reach rnrnewlife.com:
 *
 *   npm run sync:catalog              # live fetch
 *   npm run sync:catalog -- --dry-run # print what would change, write nothing
 *   npm run sync:catalog -- --from ./book.html   # parse a saved copy instead
 *
 * The parser targets the WordPress/WooCommerce markup the site serves today.
 * If the theme changes, adjust SELECTORS below — everything else is generic.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOG_PATH = resolve(__dirname, '../src/data/catalog.json')
const INDEX_URL = 'https://rnrnewlife.com/book/'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const fromIndex = args.indexOf('--from')
const localFile = fromIndex === -1 ? null : args[fromIndex + 1]

/** WooCommerce product-grid selectors, expressed as regexes over raw HTML. */
const SELECTORS = {
  product: /<li[^>]*class="[^"]*\bproduct\b[^"]*"[\s\S]*?<\/li>/g,
  href: /<a[^>]+href="([^"]+)"/,
  title: /<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([\s\S]*?)<\/h2>/,
  price: /<span[^>]*class="woocommerce-Price-amount[^"]*"[^>]*>([\s\S]*?)<\/span>/,
  image: /<img[^>]+src="([^"]+)"/,
  /** Fallback for non-Woo listings: any anchor that looks like a book link. */
  anchor: /<a[^>]+href="(https?:\/\/rnrnewlife\.com\/(?:book|product)\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
}

const CATEGORY_HINTS = [
  { id: 'family', words: ['ครอบครัว', 'ลูก', 'คู่', 'สามี', 'ภรรยา', 'family'] },
  { id: 'body', words: ['สุขภาพ', 'กาย', 'อาหาร', 'นอน', 'ออกกำลัง', 'health'] },
  { id: 'mind', words: ['ใจ', 'เครียด', 'อารมณ์', 'จิตใจ', 'mind'] },
  { id: 'spirit', words: ['พระ', 'อธิษฐาน', 'ความเชื่อ', 'จิตวิญญาณ', 'เฝ้าเดี่ยว', 'spirit'] },
]

function stripTags(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#[0-9]+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function guessCategory(text) {
  const lower = text.toLowerCase()
  for (const { id, words } of CATEGORY_HINTS) {
    if (words.some((w) => lower.includes(w.toLowerCase()))) return id
  }
  return 'spirit'
}

function slugFromUrl(url, fallback) {
  const parts = new URL(url).pathname.split('/').filter(Boolean)
  const last = parts.at(-1)
  if (!last) return fallback
  // Thai slugs arrive percent-encoded; keep them readable but URL-safe.
  return decodeURIComponent(last).replace(/\s+/g, '-')
}

function parsePrice(raw) {
  if (!raw) return 0
  const digits = stripTags(raw).replace(/[^\d.]/g, '')
  return digits ? Math.round(Number(digits)) : 0
}

async function loadHtml() {
  if (localFile) {
    console.log(`Reading ${localFile}`)
    return readFile(resolve(process.cwd(), localFile), 'utf8')
  }
  console.log(`Fetching ${INDEX_URL}`)
  const response = await fetch(INDEX_URL, {
    headers: {
      'User-Agent': 'rnrnewlife-book-app/1.0 (catalog sync)',
      'Accept-Language': 'th,en;q=0.8',
    },
  })
  if (!response.ok) {
    throw new Error(
      `${INDEX_URL} responded ${response.status}. ` +
        'If the network blocks the domain, save the page and pass --from ./book.html',
    )
  }
  return response.text()
}

function parseBooks(html) {
  const found = []
  const seen = new Set()

  for (const block of html.match(SELECTORS.product) ?? []) {
    const href = block.match(SELECTORS.href)?.[1]
    const title = stripTags(block.match(SELECTORS.title)?.[1] ?? '')
    if (!href || !title || seen.has(href)) continue
    seen.add(href)

    found.push({
      title,
      sourceUrl: href,
      price: parsePrice(block.match(SELECTORS.price)?.[1]),
      image: block.match(SELECTORS.image)?.[1],
    })
  }

  if (found.length === 0) {
    // Theme without a Woo product grid — fall back to plain links.
    for (const match of html.matchAll(SELECTORS.anchor)) {
      const [, href, inner] = match
      const title = stripTags(inner)
      if (!title || title.length < 2 || seen.has(href)) continue
      seen.add(href)
      found.push({ title, sourceUrl: href, price: 0, image: undefined })
    }
  }

  return found
}

function toCatalogBook(entry, index) {
  const category = guessCategory(entry.title)
  const slug = slugFromUrl(entry.sourceUrl, `book-${index + 1}`)

  return {
    id: `bk-${category}-${String(index + 1).padStart(2, '0')}`,
    slug,
    title: entry.title,
    author: 'RnR New Life',
    category,
    summary: `ดูรายละเอียดและดาวน์โหลดได้ที่ ${entry.sourceUrl}`,
    tags: [],
    formats: ['pdf'],
    price: entry.price,
    sourceUrl: entry.sourceUrl,
    coverUrl: entry.image,
    chapters: [],
  }
}

async function main() {
  const html = await loadHtml()
  const parsed = parseBooks(html)

  if (parsed.length === 0) {
    throw new Error(
      'No books found in the page markup. The theme may have changed — update SELECTORS in this script.',
    )
  }

  const existing = JSON.parse(await readFile(CATALOG_PATH, 'utf8'))
  const bySlug = new Map(existing.books.map((b) => [b.slug, b]))

  const books = parsed.map((entry, index) => {
    const fresh = toCatalogBook(entry, index)
    const previous = bySlug.get(fresh.slug)
    // Keep any chapter text and hand-curated metadata already in the catalog.
    return previous ? { ...previous, ...fresh, chapters: previous.chapters } : fresh
  })

  const next = {
    ...existing,
    source: {
      ...existing.source,
      syncedAt: new Date().toISOString().slice(0, 10),
      placeholder: false,
      note: `ซิงก์จาก ${INDEX_URL} เมื่อ ${new Date().toISOString().slice(0, 10)}`,
    },
    books,
  }

  console.log(`Parsed ${books.length} books:`)
  for (const book of books) console.log(`  · ${book.title} (${book.category}, ${book.price})`)

  if (dryRun) {
    console.log('\n--dry-run: catalog.json not written')
    return
  }

  await writeFile(CATALOG_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  console.log(`\nWrote ${CATALOG_PATH}`)
  console.log('Chapter text is not published on the index page — add it by hand or extend this script.')
}

main().catch((error) => {
  console.error(`\nsync failed: ${error.message}`)
  process.exitCode = 1
})
