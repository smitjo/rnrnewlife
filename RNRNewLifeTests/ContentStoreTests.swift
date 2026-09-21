import XCTest
@testable import RNRNewLife

final class ContentStoreTests: XCTestCase {
    private func date(_ iso: String) -> Date {
        ISO8601DateFormatter().date(from: iso)!
    }

    func testLoadsBundledContent() {
        let store = ContentStore()
        store.load()

        XCTAssertEqual(store.state, .loaded)
        XCTAssertFalse(store.content.announcements.isEmpty)
        XCTAssertFalse(store.content.events.isEmpty)
        XCTAssertEqual(store.content.websiteURL.host(), "rnrnewlife.com")
    }

    func testLoadFailsGracefullyWhenResourceIsMissing() {
        let store = ContentStore(resourceName: "DoesNotExist")
        store.load()

        guard case .failed = store.state else {
            return XCTFail("expected a failed state, got \(store.state)")
        }
        XCTAssertEqual(store.content, .empty)
    }

    func testLoadIfNeededOnlyLoadsOnce() {
        let store = ContentStore(resourceName: "DoesNotExist")
        store.loadIfNeeded()
        guard case .failed = store.state else {
            return XCTFail("expected a failed state, got \(store.state)")
        }
        // A second call must not reset or re-run the load.
        store.loadIfNeeded()
        guard case .failed = store.state else {
            return XCTFail("state changed on the second call")
        }
    }

    func testAnnouncementsArePinnedFirstThenNewest() {
        let content = SiteContent(
            siteName: "S",
            tagline: "",
            websiteURL: URL(string: "https://rnrnewlife.com")!,
            contactEmail: "",
            about: "",
            announcements: [
                Announcement(id: "old", title: "Old", body: "", publishedAt: date("2026-01-01T00:00:00Z")),
                Announcement(id: "new", title: "New", body: "", publishedAt: date("2026-06-01T00:00:00Z")),
                Announcement(id: "pinned", title: "Pinned", body: "", publishedAt: date("2025-01-01T00:00:00Z"), isPinned: true)
            ],
            events: []
        )
        let store = ContentStore(content: content)

        XCTAssertEqual(store.sortedAnnouncements.map(\.id), ["pinned", "new", "old"])
    }
}
