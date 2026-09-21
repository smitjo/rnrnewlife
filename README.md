# rnrnewlife

iOS app for rnrnewlife.com.

## Requirements

- macOS with Xcode 16 or newer
- iOS 17.0 deployment target

## Build and run

```sh
open RNRNewLife.xcodeproj
```

Then select an iPhone simulator and press ⌘R.

From the command line:

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

## Layout

```
RNRNewLife/
  RNRNewLifeApp.swift      app entry point
  Models/                  Announcement, Event, EventDay, SiteContent
  Store/ContentStore.swift loads and sorts the bundled content
  Views/                   Home, Schedule, About
  Resources/Content.json   the content the app renders
RNRNewLifeTests/           unit tests for decoding, sorting and grouping
```

## Editing the content

Everything the app shows comes from `RNRNewLife/Resources/Content.json` — site
name, tagline, about text, contact details, announcements and events. Dates are
ISO-8601 (`2026-09-24T17:00:00Z`). `isPinned` is optional on an announcement and
defaults to `false`. Events disappear from the schedule once they have finished.

The placeholder copy in that file is a stand-in; replace it with the real
rnrnewlife.com content.
