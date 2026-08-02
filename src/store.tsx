import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { clearAllStoredData, usePersistentState } from './lib/storage'

export type ThemeName = 'light' | 'sepia' | 'dark'

export interface Settings {
  theme: ThemeName
  /** Reader body size multiplier. */
  fontScale: number
  /** Serif is easier on the eyes for long-form Thai reading. */
  serif: boolean
}

export interface Progress {
  chapterIndex: number
  paragraphIndex: number
  /** 0–1, computed when progress is recorded. */
  percent: number
  updatedAt: number
  finished: boolean
}

export interface Bookmark {
  bookSlug: string
  chapterIndex: number
  paragraphIndex: number
  excerpt: string
  createdAt: number
}

const DEFAULT_SETTINGS: Settings = { theme: 'light', fontScale: 1, serif: false }

interface StoreValue {
  settings: Settings
  setSettings: (update: Partial<Settings>) => void

  saved: string[]
  isSaved: (slug: string) => boolean
  toggleSaved: (slug: string) => void

  progress: Record<string, Progress>
  recordProgress: (slug: string, next: Progress) => void
  clearProgress: (slug: string) => void

  bookmarks: Bookmark[]
  addBookmark: (bookmark: Bookmark) => void
  removeBookmark: (createdAt: number) => void

  resetEverything: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsRaw] = usePersistentState<Settings>('settings', DEFAULT_SETTINGS)
  const [saved, setSaved] = usePersistentState<string[]>('saved', [])
  const [progress, setProgress] = usePersistentState<Record<string, Progress>>('progress', {})
  const [bookmarks, setBookmarks] = usePersistentState<Bookmark[]>('bookmarks', [])

  // Theme + reader font size are applied at the document level so the reader,
  // the shell and the browser chrome all stay in sync.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = settings.theme
    root.style.setProperty('--reader-scale', String(settings.fontScale))
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      const colors: Record<ThemeName, string> = {
        light: '#0f766e',
        sepia: '#8a5a20',
        dark: '#0c1110',
      }
      meta.setAttribute('content', colors[settings.theme])
    }
  }, [settings.theme, settings.fontScale])

  const setSettings = useCallback(
    (update: Partial<Settings>) => setSettingsRaw((prev) => ({ ...prev, ...update })),
    [setSettingsRaw],
  )

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved])

  const toggleSaved = useCallback(
    (slug: string) =>
      setSaved((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev])),
    [setSaved],
  )

  const recordProgress = useCallback(
    (slug: string, next: Progress) => setProgress((prev) => ({ ...prev, [slug]: next })),
    [setProgress],
  )

  const clearProgress = useCallback(
    (slug: string) =>
      setProgress((prev) => {
        const copy = { ...prev }
        delete copy[slug]
        return copy
      }),
    [setProgress],
  )

  const addBookmark = useCallback(
    (bookmark: Bookmark) => setBookmarks((prev) => [bookmark, ...prev]),
    [setBookmarks],
  )

  const removeBookmark = useCallback(
    (createdAt: number) => setBookmarks((prev) => prev.filter((b) => b.createdAt !== createdAt)),
    [setBookmarks],
  )

  const resetEverything = useCallback(() => {
    clearAllStoredData()
    setSettingsRaw(DEFAULT_SETTINGS)
    setSaved([])
    setProgress({})
    setBookmarks([])
  }, [setBookmarks, setProgress, setSaved, setSettingsRaw])

  const value = useMemo<StoreValue>(
    () => ({
      settings,
      setSettings,
      saved,
      isSaved,
      toggleSaved,
      progress,
      recordProgress,
      clearProgress,
      bookmarks,
      addBookmark,
      removeBookmark,
      resetEverything,
    }),
    [
      settings,
      setSettings,
      saved,
      isSaved,
      toggleSaved,
      progress,
      recordProgress,
      clearProgress,
      bookmarks,
      addBookmark,
      removeBookmark,
      resetEverything,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
