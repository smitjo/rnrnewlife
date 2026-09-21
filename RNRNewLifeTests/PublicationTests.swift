import XCTest
@testable import RNRNewLife

final class PublicationTests: XCTestCase {
    private func makeChapter(id: String = "c1", title: String = "Chapter", words: Int) -> Chapter {
        Chapter(
            id: id,
            title: title,
            paragraphs: [Array(repeating: "word", count: words).joined(separator: " ")]
        )
    }

    private func makePublication(
        id: String = "p1",
        title: String = "Title",
        author: String = "Author",
        category: String = "Bible Studies",
        summary: String = "Summary",
        chapters: [Chapter] = []
    ) -> Publication {
        Publication(
            id: id,
            title: title,
            author: author,
            category: category,
            summary: summary,
            language: "English",
            chapters: chapters
        )
    }

    func testWordCountSumsEveryParagraph() {
        let chapter = Chapter(id: "c1", title: "T", paragraphs: ["one two three", "four five"])
        XCTAssertEqual(chapter.wordCount, 5)
        XCTAssertEqual(makePublication(chapters: [chapter, chapter]).wordCount, 10)
    }

    func testWordCountIgnoresExtraWhitespace() {
        let chapter = Chapter(id: "c1", title: "T", paragraphs: ["  one   two \n three  "])
        XCTAssertEqual(chapter.wordCount, 3)
    }

    func testReadingTimeRoundsUpAt200WordsPerMinute() {
        XCTAssertEqual(makePublication(chapters: [makeChapter(words: 400)]).estimatedReadingMinutes, 2)
        XCTAssertEqual(makePublication(chapters: [makeChapter(words: 401)]).estimatedReadingMinutes, 3)
    }

    func testReadingTimeIsNeverZero() {
        XCTAssertEqual(makePublication(chapters: []).estimatedReadingMinutes, 1)
        XCTAssertEqual(makePublication(chapters: [makeChapter(words: 1)]).estimatedReadingMinutes, 1)
    }

    func testEmptyQueryMatchesEverything() {
        XCTAssertTrue(makePublication().matches(query: ""))
        XCTAssertTrue(makePublication().matches(query: "   "))
    }

    func testSearchMatchesTitleAuthorCategoryAndSummary() {
        let publication = makePublication(
            title: "Steps to Health",
            author: "A Writer",
            category: "Devotionals",
            summary: "A short reading on rest."
        )
        XCTAssertTrue(publication.matches(query: "health"))
        XCTAssertTrue(publication.matches(query: "writer"))
        XCTAssertTrue(publication.matches(query: "devotion"))
        XCTAssertTrue(publication.matches(query: "rest"))
        XCTAssertFalse(publication.matches(query: "prophecy"))
    }

    func testSearchIgnoresCaseAndAccents() {
        let publication = makePublication(title: "El Espíritu de Profecía")
        XCTAssertTrue(publication.matches(query: "espiritu"))
        XCTAssertTrue(publication.matches(query: "PROFECIA"))
    }

    func testMatchingFiltersTheCollection() {
        let studies = makePublication(id: "a", title: "Daniel", category: "Bible Studies")
        let health = makePublication(id: "b", title: "Nutrition", category: "Health")

        XCTAssertEqual([studies, health].matching(query: "Health").map(\.id), ["b"])
        XCTAssertEqual([studies, health].matching(query: "").map(\.id), ["a", "b"])
    }

    func testGroupingSortsCategoriesAndTitlesAlphabetically() {
        let items = [
            makePublication(id: "1", title: "Zeal", category: "Health"),
            makePublication(id: "2", title: "Apples", category: "Health"),
            makePublication(id: "3", title: "Daniel", category: "Bible Studies")
        ]

        let sections = items.groupedByCategory()

        XCTAssertEqual(sections.map(\.category), ["Bible Studies", "Health"])
        XCTAssertEqual(sections[1].publications.map(\.title), ["Apples", "Zeal"])
    }

    func testGroupingAnEmptyLibraryProducesNoSections() {
        XCTAssertTrue([Publication]().groupedByCategory().isEmpty)
    }
}
