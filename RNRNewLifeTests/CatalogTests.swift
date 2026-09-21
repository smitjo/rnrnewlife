import XCTest
@testable import RNRNewLife

final class CatalogTests: XCTestCase {
    private let json = Data("""
    {
      "missionName": "R&R New Life",
      "tagline": "Reading materials.",
      "websiteURL": "https://rnrnewlife.com",
      "contactEmail": "hello@rnrnewlife.com",
      "about": "About text.",
      "publications": [
        {
          "id": "p1",
          "title": "A Study",
          "author": "An Author",
          "category": "Bible Studies",
          "summary": "Summary.",
          "language": "English",
          "chapters": [
            {
              "id": "p1-c1",
              "title": "Lesson One",
              "paragraphs": ["First paragraph.", "Second paragraph."]
            }
          ]
        }
      ]
    }
    """.utf8)

    func testDecodesCatalog() throws {
        let catalog = try Catalog.decode(from: json)

        XCTAssertEqual(catalog.missionName, "R&R New Life")
        XCTAssertEqual(catalog.websiteURL.absoluteString, "https://rnrnewlife.com")
        XCTAssertEqual(catalog.publications.count, 1)
        XCTAssertEqual(catalog.publications[0].chapters.first?.paragraphs.count, 2)
    }

    func testRejectsMalformedJSON() {
        XCTAssertThrowsError(try Catalog.decode(from: Data(#"{"missionName":"only"}"#.utf8)))
    }

    func testEmptyCatalogHasNoPublications() {
        XCTAssertTrue(Catalog.empty.publications.isEmpty)
    }
}
