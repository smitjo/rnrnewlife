# RnR New Life · ห้องสมุดหนังสือ

A book library app for [RnR New Life Ministry](https://rnrnewlife.com/) — an installable,
offline-capable web app built around the ministry's book section at
<https://rnrnewlife.com/book/>.

The interface is Thai, matching the site.

## What it does

| Screen                   | Features                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **หน้าแรก** (Home)       | Featured title, "continue reading" with progress, category tiles, free-download and new-release shelves                                                                     |
| **ค้นหา** (Browse)       | Full-text search over titles/subtitles/authors/summaries/tags, category + free-only filters, three sort orders. All filter state lives in the URL, so a search is shareable |
| **หน้าหนังสือ** (Detail) | Cover, metadata, formats, price, tags, table of contents, save-to-library, download and "open on the website" links                                                         |
| **หน้าอ่าน** (Reader)    | Chapter navigation (buttons + ← / → keys), table-of-contents drawer, font size, serif toggle, three themes, bookmarks, scroll-based progress tracking                       |
| **ชั้นหนังสือ** (Library) | Currently reading, saved, finished, and bookmarks tabs                                                                                                                     |
| **ตั้งค่า** (Settings)   | Theme, reader typography, reading-data summary and reset, catalog provenance, ministry contacts                                                                            |

Other details:

- **Three themes** — light, sepia, dark — driven by `data-theme` on `<html>`; every surface reads from CSS variables.
- **Offline** — a service worker caches the shell and build assets, so the library opens without a connection. Anything on `rnrnewlife.com` always goes to the network.
- **Local-only data** — reading progress, saved books, bookmarks and settings live in `localStorage`. Nothing is sent anywhere.
- **Generated covers** — each cover is derived deterministically from the book id, so the app works before any artwork has been synced. Once `coverUrl` is present in the catalog the real artwork is used, falling back to the generated cover if the image fails to load.
- **HashRouter** — the build drops onto any static host (GitHub Pages, a subdirectory on rnrnewlife.com) with no rewrite rules.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
npm run typecheck
```

## The catalog

All book data lives in a single file, [`src/data/catalog.json`](src/data/catalog.json), typed by
[`src/data/types.ts`](src/data/types.ts). Nothing else in the app needs to change when the catalog does.

**The bundled catalog is seed data, not the ministry's real book list.** `rnrnewlife.com` is not
reachable from the sandbox this app was built in — the network policy rejects the domain outright —
so the titles, summaries and chapter text shipped here are placeholders written to exercise the UI.
The app says so in a banner on every screen and on the settings page, and the banner disappears
automatically once `source.placeholder` is `false`.

To replace it with the real catalog, run this from a machine that can reach the site:

```bash
npm run sync:catalog                          # fetch https://rnrnewlife.com/book/ and rewrite catalog.json
npm run sync:catalog -- --dry-run             # print what would change, write nothing
npm run sync:catalog -- --from ./book.html    # parse a saved copy of the page instead
```

[`scripts/sync-catalog.mjs`](scripts/sync-catalog.mjs) parses the WooCommerce product grid the site
serves (title, link, price, cover image), infers a category from Thai keywords, preserves any chapter
text already in `catalog.json`, and stamps `source.syncedAt`. If the site's theme changes, adjust the
`SELECTORS` block at the top of the script — the rest is generic.

The book index page does not publish chapter text, so `chapters` still has to be filled in by hand
(or by extending the script to follow each product link).

## Layout

```
src/
  data/         catalog.json (the only place book data lives) + types + query helpers
  lib/          localStorage persistence
  routes/       Home, Browse, BookDetail, Reader, Library, Settings
  components/   Layout (nav shell), Cover, BookCard, Shelf, icons
  store.tsx     settings, saved books, reading progress, bookmarks
public/         service worker, web manifest, icon
scripts/        catalog sync
```
