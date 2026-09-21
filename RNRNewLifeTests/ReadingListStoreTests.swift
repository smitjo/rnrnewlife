import XCTest
@testable import RNRNewLife

final class ReadingListStoreTests: XCTestCase {
    private var suiteName: String!
    private var defaults: UserDefaults!

    override func setUp() {
        super.setUp()
        suiteName = "ReadingListStoreTests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
        defaults = nil
        suiteName = nil
        super.tearDown()
    }

    func testStartsEmpty() {
        let store = ReadingListStore(defaults: defaults)

        XCTAssertTrue(store.savedIDs.isEmpty)
        XCTAssertFalse(store.isSaved("p1"))
        XCTAssertNil(store.lastChapterID(for: "p1"))
    }

    func testTogglingSavesAndUnsaves() {
        let store = ReadingListStore(defaults: defaults)

        store.toggleSaved("p1")
        XCTAssertTrue(store.isSaved("p1"))
        XCTAssertEqual(store.savedIDs, ["p1"])

        store.toggleSaved("p1")
        XCTAssertFalse(store.isSaved("p1"))
        XCTAssertTrue(store.savedIDs.isEmpty)
    }

    func testSavedOrderIsMostRecentLast() {
        let store = ReadingListStore(defaults: defaults)

        store.toggleSaved("p1")
        store.toggleSaved("p2")

        XCTAssertEqual(store.savedIDs, ["p1", "p2"])
    }

    func testSavedItemsSurviveARestart() {
        let store = ReadingListStore(defaults: defaults)
        store.toggleSaved("p1")
        store.recordOpened(chapterID: "c2", in: "p1")

        let reopened = ReadingListStore(defaults: defaults)

        XCTAssertEqual(reopened.savedIDs, ["p1"])
        XCTAssertEqual(reopened.lastChapterID(for: "p1"), "c2")
    }

    func testRecordingProgressOverwritesThePreviousChapter() {
        let store = ReadingListStore(defaults: defaults)

        store.recordOpened(chapterID: "c1", in: "p1")
        store.recordOpened(chapterID: "c2", in: "p1")

        XCTAssertEqual(store.lastChapterID(for: "p1"), "c2")
    }

    func testProgressIsTrackedPerPublication() {
        let store = ReadingListStore(defaults: defaults)

        store.recordOpened(chapterID: "c1", in: "p1")
        store.recordOpened(chapterID: "c9", in: "p2")

        XCTAssertEqual(store.lastChapterID(for: "p1"), "c1")
        XCTAssertEqual(store.lastChapterID(for: "p2"), "c9")
    }

    func testForgetClearsBothSavedStateAndProgress() {
        let store = ReadingListStore(defaults: defaults)
        store.toggleSaved("p1")
        store.recordOpened(chapterID: "c1", in: "p1")

        store.forget("p1")

        XCTAssertFalse(store.isSaved("p1"))
        XCTAssertNil(store.lastChapterID(for: "p1"))
        XCTAssertNil(ReadingListStore(defaults: defaults).lastChapterID(for: "p1"))
    }
}
