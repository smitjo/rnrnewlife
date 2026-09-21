import { useState } from 'react'
import { InfoIcon } from '../components/icons'
import { books, ministry, source } from '../data/catalog'
import { useStore } from '../store'
import type { ThemeName } from '../store'

const THEMES: { id: ThemeName; label: string }[] = [
  { id: 'light', label: 'สว่าง' },
  { id: 'sepia', label: 'ซีเปีย' },
  { id: 'dark', label: 'มืด' },
]

export function Settings() {
  const { settings, setSettings, resetEverything, saved, bookmarks, progress } = useStore()
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="space-y-6 py-4 sm:px-4 lg:py-8">
      <h1 className="px-4 text-xl font-bold sm:px-0">ตั้งค่า</h1>

      <section className="surface mx-4 space-y-4 rounded-2xl p-4 sm:mx-0">
        <h2 className="text-sm font-bold">การอ่าน</h2>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm">ธีม</span>
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm">ขนาดตัวอักษร</span>
          <input
            type="range"
            min={0.85}
            max={1.6}
            step={0.05}
            value={settings.fontScale}
            onChange={(e) => setSettings({ fontScale: Number(e.target.value) })}
            aria-label="ขนาดตัวอักษรในหน้าอ่าน"
            className="w-40"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm">ใช้ฟอนต์มีเชิงในหน้าอ่าน</span>
          <button
            type="button"
            className="chip"
            data-active={settings.serif}
            aria-pressed={settings.serif}
            onClick={() => setSettings({ serif: !settings.serif })}
          >
            {settings.serif ? 'เปิด' : 'ปิด'}
          </button>
        </div>
      </section>

      <section className="surface mx-4 space-y-3 rounded-2xl p-4 sm:mx-0">
        <h2 className="text-sm font-bold">ข้อมูลของฉัน</h2>
        <dl className="muted grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <dt className="text-xs">บันทึกไว้</dt>
            <dd className="text-lg font-bold" style={{ color: 'var(--app-text)' }}>
              {saved.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs">กำลังอ่าน</dt>
            <dd className="text-lg font-bold" style={{ color: 'var(--app-text)' }}>
              {Object.values(progress).filter((p) => !p.finished).length}
            </dd>
          </div>
          <div>
            <dt className="text-xs">ที่คั่นหน้า</dt>
            <dd className="text-lg font-bold" style={{ color: 'var(--app-text)' }}>
              {bookmarks.length}
            </dd>
          </div>
        </dl>
        <p className="muted text-xs">
          ข้อมูลทั้งหมดถูกเก็บไว้ในเครื่องของคุณเท่านั้น ไม่มีการส่งออกไปที่ใด
        </p>

        {confirming ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                resetEverything()
                setConfirming(false)
              }}
            >
              ยืนยันการล้างข้อมูล
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
              ยกเลิก
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)}>
            ล้างข้อมูลการอ่านทั้งหมด
          </button>
        )}
      </section>

      <section className="surface mx-4 space-y-2 rounded-2xl p-4 text-sm sm:mx-0">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <InfoIcon className="h-4 w-4" />
          แหล่งข้อมูล
        </h2>
        <p className="muted text-xs leading-relaxed">{source.note}</p>
        <dl className="muted space-y-1 text-xs">
          <div className="flex gap-2">
            <dt>หน้าหนังสือ:</dt>
            <dd>
              <a
                href={source.bookIndex}
                target="_blank"
                rel="noreferrer noopener"
                className="underline"
              >
                {source.bookIndex}
              </a>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt>ซิงก์ล่าสุด:</dt>
            <dd>{source.syncedAt ?? 'ยังไม่เคยซิงก์'}</dd>
          </div>
          <div className="flex gap-2">
            <dt>จำนวนหนังสือในแอป:</dt>
            <dd>{books.length} เล่ม</dd>
          </div>
        </dl>
      </section>

      <section className="surface mx-4 space-y-1 rounded-2xl p-4 text-sm sm:mx-0">
        <h2 className="text-sm font-bold">ติดต่อพันธกิจ</h2>
        <p className="muted text-xs">{ministry.name}</p>
        <a href={`mailto:${ministry.email}`} className="block text-xs underline">
          {ministry.email}
        </a>
        <p className="muted text-xs">{ministry.phone}</p>
      </section>
    </div>
  )
}
