import Foundation

/// A short message shown on the home screen.
struct Announcement: Identifiable, Codable, Equatable {
    let id: String
    let title: String
    let body: String
    let publishedAt: Date
    var isPinned: Bool

    init(id: String, title: String, body: String, publishedAt: Date, isPinned: Bool = false) {
        self.id = id
        self.title = title
        self.body = body
        self.publishedAt = publishedAt
        self.isPinned = isPinned
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        body = try container.decode(String.self, forKey: .body)
        publishedAt = try container.decode(Date.self, forKey: .publishedAt)
        // Optional in the feed; most announcements are not pinned.
        isPinned = try container.decodeIfPresent(Bool.self, forKey: .isPinned) ?? false
    }
}
