import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ministry, source } from '../data/catalog'
import { HomeIcon, LibraryIcon, SearchIcon, SettingsIcon } from './icons'

const NAV = [
  { to: '/', label: 'หน้าแรก', Icon: HomeIcon, end: true },
  { to: '/browse', label: 'ค้นหา', Icon: SearchIcon, end: false },
  { to: '/library', label: 'ชั้นหนังสือ', Icon: LibraryIcon, end: false },
  { to: '/settings', label: 'ตั้งค่า', Icon: SettingsIcon, end: false },
]

function NavItems({ vertical }: { vertical?: boolean }) {
  return (
    <>
      {NAV.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              vertical ? 'w-full' : 'flex-1 flex-col gap-1 py-2 text-[0.68rem]',
              isActive ? 'font-semibold' : 'muted',
            ].join(' ')
          }
          style={({ isActive }) =>
            isActive
              ? { background: 'var(--app-accent-soft)', color: 'var(--app-accent)' }
              : undefined
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={vertical ? 'h-5 w-5' : 'h-[1.35rem] w-[1.35rem]'} />
              <span>{label}</span>
              {vertical && isActive && <span className="sr-only">(หน้าปัจจุบัน)</span>}
            </>
          )}
        </NavLink>
      ))}
    </>
  )
}

export function Layout() {
  const { pathname } = useLocation()

  // Every navigation should start at the top of the new screen.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
      <aside
        className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r px-4 py-6 lg:flex"
        style={{ borderColor: 'var(--app-border)' }}
      >
        <div>
          <p className="text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--app-accent)' }}>
            RnR New Life
          </p>
          <h1 className="mt-1 text-xl leading-tight font-bold">ห้องสมุดหนังสือ</h1>
          <p className="muted mt-1 text-xs">{ministry.tagline}</p>
        </div>

        <nav className="flex flex-col gap-1" aria-label="เมนูหลัก">
          <NavItems vertical />
        </nav>

        <div className="mt-auto space-y-2 text-xs">
          <a
            href={ministry.website}
            target="_blank"
            rel="noreferrer noopener"
            className="muted block hover:underline"
          >
            rnrnewlife.com
          </a>
          <a href={`mailto:${ministry.email}`} className="muted block hover:underline">
            {ministry.email}
          </a>
          <p className="muted">{ministry.phone}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-20 border-b px-4 py-3 backdrop-blur lg:hidden"
          style={{
            borderColor: 'var(--app-border)',
            background: 'color-mix(in srgb, var(--app-bg) 88%, transparent)',
          }}
        >
          <p className="text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--app-accent)' }}>
            RnR New Life
          </p>
          <h1 className="text-base font-bold">ห้องสมุดหนังสือ</h1>
        </header>

        {source.placeholder && <PlaceholderNotice />}

        <main className="flex-1 pb-24 lg:pb-10">
          <Outlet />
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex border-t px-2 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] lg:hidden"
          style={{ borderColor: 'var(--app-border)', background: 'var(--app-surface)' }}
          aria-label="เมนูหลัก"
        >
          <NavItems />
        </nav>
      </div>
    </div>
  )
}

/**
 * The bundled catalog is seed data until someone runs the sync script from a
 * network that can reach rnrnewlife.com. Say so plainly rather than presenting
 * placeholder titles as the ministry's real catalog.
 */
function PlaceholderNotice() {
  return (
    <p
      className="mx-4 mt-3 rounded-xl px-3 py-2 text-xs leading-relaxed lg:mx-0 lg:mt-4"
      style={{ background: 'var(--app-accent-soft)', color: 'var(--app-text)' }}
    >
      ข้อมูลหนังสือในแอปนี้เป็น <strong>ข้อมูลตัวอย่าง</strong> ยังไม่ได้ซิงก์จาก{' '}
      <a href={source.bookIndex} target="_blank" rel="noreferrer noopener" className="underline">
        rnrnewlife.com/book/
      </a>{' '}
      — รัน <code>npm run sync:catalog</code> เพื่ออัปเดตเป็นรายการจริง
    </p>
  )
}
