import Foundation

/// Loads the bundled catalog and answers the library's queries.
final class LibraryStore: ObservableObject {
    enum LoadState: Equatable {
        case idle
        case loaded
        case failed(String)
    }

    @Published private(set) var catalog: Catalog
    @Published private(set) var state: LoadState = .idle

    private let bundle: Bundle
    private let resourceName: String

    init(bundle: Bundle = .main, resourceName: String = "Catalog", catalog: Catalog = .empty) {
        self.bundle = bundle
        self.resourceName = resourceName
        self.catalog = catalog
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
            catalog = try Catalog.decode(from: Data(contentsOf: url))
            state = .loaded
        } catch {
            state = .failed(error.localizedDescription)
        }
    }

    /// Sections for the library screen, narrowed by the search query.
    func sections(matching query: String = "") -> [LibrarySection] {
        catalog.publications.matching(query: query).groupedByCategory()
    }

    func publication(id: String) -> Publication? {
        catalog.publications.first { $0.id == id }
    }

    func publications(ids: [String]) -> [Publication] {
        ids.compactMap { publication(id: $0) }
    }

    static var preview: LibraryStore {
        let store = LibraryStore()
        store.load()
        return store
    }
}
