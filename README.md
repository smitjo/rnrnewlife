# rnrnewlife

iOS reading app for rnrnewlife.com — an Adventist mission sharing free reading
materials. The library ships inside the app, so everything reads offline.

## Requirements

- macOS with Xcode 16 or newer
- iOS 17.0 deployment target

## Build and run

```sh
open RNRNewLife.xcodeproj
```

Select an iPhone simulator and press ⌘R. From the command line:

```sh
xcodebuild -project RNRNewLife.xcodeproj -scheme RNRNewLife \
  -destination 'platform=iOS Simulator,name=iPhone 16' build
```

## Test

⌘U in Xcode, or:

```sh
xcodebuild -project RNRNewLife.xcodeproj -scheme RNRNewLife \
  -destination 'platform=iOS Simulator,name=iPhone 16' test
```

## What the app does

- **Library** — every publication, grouped by category, with search across
  titles, authors, categories and summaries (case- and accent-insensitive)
- **Reader** — serif body text, adjustable text size, remembers the last
  chapter opened in each publication
- **Saved** — bookmarked publications, swipe to remove
- **About** — mission blurb, website link, contact email

## Layout

```
RNRNewLife/
  RNRNewLifeApp.swift        app entry point
  Models/Publication.swift   Publication, Chapter, LibrarySection, search + grouping
  Models/Catalog.swift       the top-level catalog
  Store/LibraryStore.swift   loads the catalog, answers library queries
  Store/ReadingListStore.swift  saved items and reading position (UserDefaults)
  Views/                     Library, PublicationDetail, Reader, Saved, About
  Resources/Catalog.json     every publication the app ships with
RNRNewLifeTests/             unit tests for the model, search, and both stores
```

## Adding reading materials

Everything the app shows lives in `RNRNewLife/Resources/Catalog.json`. A
publication looks like this:

```json
{
  "id": "unique-slug",
  "title": "Title",
  "author": "Author",
  "category": "Bible Studies",
  "summary": "One or two sentences.",
  "language": "English",
  "chapters": [
    {
      "id": "unique-slug-1",
      "title": "Chapter One",
      "paragraphs": ["First paragraph.", "Second paragraph."]
    }
  ]
}
```

Notes:

- `id` values must be unique across publications, and chapter `id` values
  unique across the whole catalog — a test enforces both.
- One string per paragraph; the reader renders each as its own block.
- `category` creates the library heading. Categories sort alphabetically, and
  titles sort alphabetically within a category.
- Reading time is derived from the word count (200 wpm), not stored.

The three publications currently in `Catalog.json` are **placeholders** marked
`PLACEHOLDER` in their summaries. rnrnewlife.com could not be reached from the
environment this was written in, so the real titles and text still need to be
dropped in.
