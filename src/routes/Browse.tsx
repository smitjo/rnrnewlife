import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookCard } from '../components/BookCard'
import { SearchIcon } from '../components/icons'
import { categories, searchBooks } from '../data/catalog'
import type { CategoryId } from '../data/types'
import type { SortKey } from '../data/catalog'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'ใหม่ล่าสุด' },
  { key: 'title', label: 'ชื่อเรื่อง' },
  { key: 'shortest', label: 'สั้นที่สุด' },
]

/** All filter state lives in the URL so a search can be shared or bookmarked. */
export function Browse() {
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const category = (params.get('cat') as CategoryId | null) ?? 'all'
  const freeOnly = params.get('free') === '1'
  const sort = (params.get('sort') as SortKey | null) ?? 'newest'

  const results = useMemo(
    () => searchBooks({ query, category, freeOnly, sort }),
    [query, category, freeOnly, sort],
  )

  function update(next: Record<string, string | null>) {
    const merged = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === '') merged.delete(key)
      else merged.set(key, value)
    }
    setParams(merged, { replace: true })
  }

  return (
    <div className="space-y-5 py-4 sm:px-4 lg:py-8">
      <div className="px-4 sm:px-0">
        <label className="relative block">
          <span className="sr-only">ค้นหาหนังสือ</span>
          <SearchIcon className="muted pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="ค้นหาชื่อเรื่อง หัวข้อ หรือคำสำคัญ"
            className="surface w-full rounded-full py-3 pr-4 pl-12 text-sm outline-none"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-0">
        <button
          type="button"
          className="chip"
          data-active={category === 'all'}
          onClick={() => update({ cat: null })}
        >
          ทั้งหมด
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip"
            data-active={category === c.id}
            onClick={() => update({ cat: c.id })}
          >
            {c.name}
          </button>
        ))}
        <button
          type="button"
          className="chip"
          data-active={freeOnly}
          onClick={() => update({ free: freeOnly ? null : '1' })}
        >
          เฉพาะฟรี
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 sm:px-0">
        <p className="muted text-sm">พบ {results.length} เล่ม</p>
        <label className="flex items-center gap-2 text-sm">
          <span className="muted">เรียงตาม</span>
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="surface rounded-full px-3 py-1.5 text-sm outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {results.length === 0 ? (
        <p className="muted px-4 py-10 text-center text-sm sm:px-0">
          ไม่พบหนังสือที่ตรงกับเงื่อนไข ลองเปลี่ยนคำค้นหรือหมวดหมู่
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-4 sm:grid-cols-3 sm:px-0 lg:grid-cols-4">
          {results.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
