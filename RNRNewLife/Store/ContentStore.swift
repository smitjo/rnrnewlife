import Foundation

/// Loads the bundled site content and exposes it to the views.
final class ContentStore: ObservableObject {
    enum LoadState: Equatable {
        case idle
        case loaded
        case failed(String)
    }

    @Published private(set) var content: SiteContent
    @Published private(set) var state: LoadState = .idle

    private let bundle: Bundle
    private let resourceName: String

    init(bundle: Bundle = .main, resourceName: String = "Content", content: SiteContent = .empty) {
        self.bundle = bundle
        self.resourceName = resourceName
        self.content = content
    }

    func loadIfNeeded() {
        guard state == .idle else { return }
        load()
    }

    func load() {
        do {
            guard let url = bundle.url(forResource: resourceName, withExtension: "json") else {
                throw CocoaError(.fileNoSuchFile)
            }
            content = try SiteContent.decode(from: Data(contentsOf: url))
            state = .loaded
        } catch {
            state = .failed(error.localizedDescription)
        }
    }

    /// Pinned announcements first, then newest first.
    var sortedAnnouncements: [Announcement] {
        content.announcements.sorted { lhs, rhs in
            if lhs.isPinned != rhs.isPinned { return lhs.isPinned }
            return lhs.publishedAt > rhs.publishedAt
        }
    }

    func upcomingEvents(asOf now: Date = Date()) -> [Event] {
        content.events.upcoming(asOf: now)
    }

    func scheduleByDay(asOf now: Date = Date()) -> [EventDay] {
        content.events.groupedByDay(asOf: now)
    }

    static var preview: ContentStore {
        let store = ContentStore()
        store.load()
        return store
    }
}
