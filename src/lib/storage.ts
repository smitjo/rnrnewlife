import { useCallback, useEffect, useState } from 'react'

const PREFIX = 'rnr:'

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    // Corrupt or blocked storage should never take the app down.
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* quota exceeded or private mode — reading still works in-memory */
  }
}

/** `useState` that persists to localStorage and syncs across tabs. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial))

  useEffect(() => {
    write(key, value)
  }, [key, value])

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== PREFIX + key) return
      setValue(read(key, initial))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // `initial` is only used as a fallback; re-subscribing on identity change is noise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const reset = useCallback(() => setValue(initial), [initial])

  return [value, setValue, reset] as const
}

export function clearAllStoredData(): void {
  try {
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIX))
    keys.forEach((k) => window.localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}
