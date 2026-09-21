import Foundation

/// Everything the app renders, as shipped in `Content.json`.
struct SiteContent: Codable, Equatable {
    let siteName: String
    let tagline: String
    let websiteURL: URL
    let contactEmail: String
    let about: String
    let announcements: [Announcement]
    let events: [Event]

    static let empty = SiteContent(
        siteName: "R&R New Life",
        tagline: "",
        websiteURL: URL(string: "https://rnrnewlife.com")!,
        contactEmail: "",
        about: "",
        announcements: [],
        events: []
    )

    /// Decoder matching the ISO-8601 dates used in `Content.json`.
    static func makeDecoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }

    static func decode(from data: Data) throws -> SiteContent {
        try makeDecoder().decode(SiteContent.self, from: data)
    }
}
