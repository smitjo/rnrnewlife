import XCTest
@testable import RNRNewLife

final class LibraryStoreTests: XCTestCase {
    func testLoadsTheBundledCatalog() {
        let store = LibraryStore()
        store.load()

        XCTAssertEqual(store.state, .loaded)
        XCTAssertFalse(store.catalog.publications.isEmpty)
        XCTAssertEqual(store.catalog.websiteURL.host(), "rnrnewlife.com")
    }

    func testBundledCatalogHasUniquePublicationAndChapterIDs() {
        let store = LibraryStore()
        store.load()

        let publicationIDs = store.catalog.publications.map(\.id)
        XCTAssertEqual(Set(publicationIDs).count, publicationIDs.count)

        let chapterIDs = store.catalog.publications.flatMap { $0.chapters.map(\.id) }
        XCTAssertEqual(Set(chapterIDs).count, chapterIDs.count)
    }

    func testLoadFailsGracefullyWhenTheResourceIsMissing() {
        let store = LibraryStore(resourceName: "DoesNotExist")
        store.load()

        guard case .failed = store.state else {
            return XCTFail("expected a failed state, got \(store.state)")
        }
        XCTAssertEqual(store.catalog, .empty)
    }

    func testLoadIfNeededOnlyRunsOnce() {
        let store = LibraryStore(resourceName: "DoesNotExist")
        store.loadIfNeeded()
        store.loadIfNeeded()

        guard case .failed = store.state else {
            return XCTFail("expected the failed state to stick, got \(store.state)")
        }
    }

    func testSectionsNarrowWithTheSearchQuery() {
        let store = LibraryStore(catalog: makeCatalog())

        XCTAssertEqual(store.sections().map(\.category), ["Bible Studies", "Health"])
        XCTAssertEqual(store.sections(matching: "nutrition").map(\.category), ["Health"])
        XCTAssertTrue(store.sections(matching: "nothing here").isEmpty)
    }

    func testPublicationLookupByID() {
        let store = LibraryStore(catalog: makeCatalog())

        XCTAssertEqual(store.publication(id: "b")?.title, "Nutrition")
        XCTAssertNil(store.publication(id: "missing"))
    }

    func testPublicationsForIDsPreservesOrderAndDropsUnknownIDs() {
        let store = LibraryStore(catalog: makeCatalog())

        XCTAssertEqual(store.publications(ids: ["b", "missing", "a"]).map(\.id), ["b", "a"])
    }

    private func makeCatalog() -> Catalog {
        Catalog(
            missionName: "M",
            tagline: "",
            websiteURL: URL(string: "https://rnrnewlife.com")!,
            contactEmail: "",
            about: "",
            publications: [
                Publication(id: "a", title: "Daniel", author: "", category: "Bible Studies", summary: "", language: "English", chapters: []),
                Publication(id: "b", title: "Nutrition", author: "", category: "Health", summary: "", language: "English", chapters: [])
            ]
        )
    }
}
