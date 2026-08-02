import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  BookmarkIcon,
  ChevronLeft,
  ChevronRight,
  CloseIcon,
  ListIcon,
  TextIcon,
} from '../components/icons'
import { getBook } from '../data/catalog'
import { useStore } from '../store'
import type { ThemeName } from '../store'

const THEMES: { id: ThemeName; label: string }[] = [
  { id: 'light', label: 'สว่าง' },
  { id: 'sepia', label: 'ซีเปีย' },
  { id: 'dark', label: 'มืด' },
]

export function Reader() {
  const { slug = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const book = getBook(slug)

  const { settings, setSettings, progress, recordProgress, addBookmark } = useStore()
  const stored = progress[slug]

  // The URL wins (deep links from the table of contents), then saved progress.
  const initialChapter = Number(params.get('ch') ?? stored?.chapterIndex ?? 0)
  const [chapterIndex, setChapterIndex] = useState(() =>
    Number.isFinite(initialChapter) ? Math.max(0, initialChapter) : 0,
  )
  const [tocOpen, setTocOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const articleRef = useRef<HTMLElement>(null)
  const chapterCount = book?.chapters.length ?? 0
  const chapter = book?.chapters[Math.min(chapterIndex, chapterCount - 1)]

  const percentFor = useCallback(
    (index: number, within: number) =>
      chapterCount === 0 ? 0 : Math.min(1, (index + within) / chapterCount),
    [chapterCount],
  )

  const goToChapter = useCallback(
    (index: number) => {
      if (!book) return
      const next = Math.max(0, Math.min(book.chapters.length - 1, index))
      setChapterIndex(next)
      setParams({ ch: String(next) }, { replace: true })
      setTocOpen(false)
      window.scrollTo({ top: 0 })
    },
    [book, setParams],
  )

  // Record progress as the reader scrolls, throttled to animation frames.
  useEffect(() => {
    if (!book) return
    const slugForProgress = book.slug
    let frame = 0

    function onScroll() {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const el = articleRef.current
        if (!el) return
        const scrollable = Math.max(1, el.scrollHeight - window.innerHeight)
        const within = Math.min(1, Math.max(0, window.scrollY / scrollable))
        const finished = chapterIndex === chapterCount - 1 && within > 0.95

        recordProgress(slugForProgress, {
          chapterIndex,
          paragraphIndex: Math.round(within * (chapter?.body.length ?? 1)),
          percent: finished ? 1 : percentFor(chapterIndex, within),
          updatedAt: Date.now(),
          finished,
        })
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [book, chapter, chapterCount, chapterIndex, percentFor, recordProgress])

  // Arrow keys page through chapters when no field has focus.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.key === 'ArrowRight') goToChapter(chapterIndex + 1)
      if (event.key === 'ArrowLeft') goToChapter(chapterIndex - 1)
      if (event.key === 'Escape') {
        setTocOpen(false)
        setTypeOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chapterIndex, goToChapter])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(id)
  }, [toast])

  const percent = useMemo(() => {
    const entry = progress[slug]
    return entry ? entry.percent : 0
  }, [progress, slug])

  if (!book || !chapter) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="font-semibold">ไม่พบหนังสือเล่มนี้</p>
        <Link to="/browse" className="btn btn-primary">
          กลับไปค้นหา
        </Link>
      </div>
    )
  }

  function saveBookmark() {
    if (!book || !chapter) return
    addBookmark({
      bookSlug: book.slug,
      chapterIndex,
      paragraphIndex: 0,
      excerpt: chapter.title,
      createdAt: Date.now(),
    })
    setToast('บันทึกที่คั่นหน้าแล้ว')
  }

  return (
    <div className="min-h-dvh" style={{ background: 'var(--app-bg)' }}>
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{
          borderColor: 'var(--app-border)',
          background: 'color-mix(in srgb, var(--app-bg) 90%, transparent)',
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-1 px-3 py-2">
          <button
            type="button"
            onClick={() => navigate(`/book/${book.slug}`)}
            className="rounded-full p-2"
            aria-label="ปิดการอ่าน"
          >
            <ChevronLeft />
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{book.title}</p>
          <button
            type="button"
            onClick={saveBookmark}
            className="rounded-full p-2"
            aria-label="คั่นหน้า"
          >
            <BookmarkIcon />
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeOpen((v) => !v)
              setTocOpen(false)
            }}
            className="rounded-full p-2"
            aria-label="ปรับตัวอักษร"
            aria-expanded={typeOpen}
          >
            <TextIcon />
          </button>
          <button
            type="button"
            onClick={() => {
              setTocOpen((v) => !v)
              setTypeOpen(false)
            }}
            className="rounded-full p-2"
            aria-label="สารบัญ"
            aria-expanded={tocOpen}
          >
            <ListIcon />
          </button>
        </div>
        <div className="h-0.5 w-full" style={{ background: 'var(--app-surface-2)' }}>
          <div
            className="h-full transition-[width] duration-200"
            style={{ width: `${percent * 100}%`, background: 'var(--app-accent)' }}
          />
        </div>
      </header>

      {typeOpen && (
        <div className="surface mx-3 mt-3 space-y-4 rounded-2xl p-4 sm:mx-auto sm:max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">ขนาดตัวอักษร</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost px-3 py-1.5"
                onClick={() =>
                  setSettings({ fontScale: Math.max(0.85, +(settings.fontScale - 0.1).toFixed(2)) })
                }
                aria-label="เล็กลง"
              >
                ก−
              </button>
              <span className="muted w-12 text-center text-sm tabular-nums">
                {Math.round(settings.fontScale * 100)}%
              </span>
              <button
                type="button"
                className="btn btn-ghost px-3 py-1.5"
                onClick={() =>
                  setSettings({ fontScale: Math.min(1.6, +(settings.fontScale + 0.1).toFixed(2)) })
                }
                aria-label="ใหญ่ขึ้น"
              >
                ก+
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">ธีม</span>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="chip"
                  data-active={settings.theme === t.id}
                  onClick={() => setSettings({ theme: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">ฟอนต์มีเชิง</span>
            <button
              type="button"
              className="chip"
              data-active={settings.serif}
              onClick={() => setSettings({ serif: !settings.serif })}
              aria-pressed={settings.serif}
            >
              {settings.serif ? 'เปิด' : 'ปิด'}
            </button>
          </div>
        </div>
      )}

      {tocOpen && (
        <nav
          className="surface mx-3 mt-3 overflow-hidden rounded-2xl sm:mx-auto sm:max-w-2xl"
          aria-label="สารบัญ"
        >
          <div
            className="flex items-center justify-between border-b px-4 py-2"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <span className="text-sm font-semibold">สารบัญ</span>
            <button type="button" onClick={() => setTocOpen(false)} aria-label="ปิดสารบัญ">
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <ol>
            {book.chapters.map((c, index) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => goToChapter(index)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm"
                  style={index === chapterIndex ? { color: 'var(--app-accent)' } : undefined}
                >
                  <span className="muted w-5 tabular-nums">{index + 1}</span>
                  <span className="flex-1">{c.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <article
        ref={articleRef}
        className="mx-auto max-w-2xl px-5 py-8"
        style={{
          fontFamily: settings.serif ? 'var(--font-serif)' : 'var(--font-sans)',
          fontSize: `calc(1.02rem * var(--reader-scale, 1))`,
          lineHeight: 1.95,
        }}
      >
        <p className="muted mb-2 text-xs tracking-widest uppercase">
          บทที่ {chapterIndex + 1} จาก {book.chapters.length}
        </p>
        <h1 className="mb-6 text-2xl leading-snug font-bold">{chapter.title}</h1>

        <div className="space-y-5">
          {chapter.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div
          className="mt-12 flex items-center justify-between gap-3 border-t pt-6"
          style={{ borderColor: 'var(--app-border)' }}
        >
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => goToChapter(chapterIndex - 1)}
            disabled={chapterIndex === 0}
            style={chapterIndex === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          >
            <ChevronLeft className="h-4 w-4" />
            บทก่อนหน้า
          </button>

          {chapterIndex < book.chapters.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => goToChapter(chapterIndex + 1)}
            >
              บทถัดไป
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <Link to={`/book/${book.slug}`} className="btn btn-primary">
              จบเล่ม
            </Link>
          )}
        </div>
      </article>

      {toast && (
        <div
          className="fixed inset-x-0 bottom-6 z-40 mx-auto w-fit rounded-full px-4 py-2 text-sm font-medium text-white"
          style={{ background: 'var(--app-accent)' }}
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
