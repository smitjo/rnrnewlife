import XCTest
@testable import RNRNewLife

final class SiteContentTests: XCTestCase {
    private let json = """
    {
      "siteName": "R&R New Life",
      "tagline": "Rest, renewal, and a fresh start.",
      "websiteURL": "https://rnrnewlife.com",
      "contactEmail": "hello@rnrnewlife.com",
      "about": "About text.",
      "announcements": [
        {
          "id": "a1",
          "title": "Pinned",
          "body": "Body",
          "publishedAt": "2026-09-15T09:00:00Z",
          "isPinned": true
        },
        {
          "id": "a2",
          "title": "Unpinned",
          "body": "Body",
          "publishedAt": "2026-09-18T14:30:00Z"
        }
      ],
      "events": [
        {
          "id": "e1",
          "title": "Weekly gathering",
          "details": "Details",
          "startsAt": "2026-09-24T17:00:00Z",
          "durationMinutes": 90,
          "location": "Main hall"
        }
      ]
    }
    """.data(using: .utf8)!

    func testDecodesTopLevelFields() throws {
        let content = try SiteContent.decode(from: json)
        XCTAssertEqual(content.siteName, "R&R New Life")
        XCTAssertEqual(content.websiteURL.absoluteString, "https://rnrnewlife.com")
        XCTAssertEqual(content.contactEmail, "hello@rnrnewlife.com")
        XCTAssertEqual(content.announcements.count, 2)
        XCTAssertEqual(content.events.count, 1)
    }

    func testIsPinnedDefaultsToFalseWhenAbsent() throws {
        let content = try SiteContent.decode(from: json)
        XCTAssertTrue(content.announcements[0].isPinned)
        XCTAssertFalse(content.announcements[1].isPinned)
    }

    func testDecodesISO8601Dates() throws {
        let content = try SiteContent.decode(from: json)
        let expected = ISO8601DateFormatter().date(from: "2026-09-24T17:00:00Z")
        XCTAssertEqual(content.events[0].startsAt, expected)
    }

    func testRejectsMalformedJSON() {
        let bad = Data(#"{"siteName": "only this"}"#.utf8)
        XCTAssertThrowsError(try SiteContent.decode(from: bad))
    }
}
