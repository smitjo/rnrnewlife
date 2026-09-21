import Foundation

/// Tracks what the reader has saved and where they left off.
///
/// Everything lives in `UserDefaults`, which is plenty for a catalog of this
/// size and keeps the app working with no account and no network.
final class ReadingListStore: ObservableObject {
    private enum Key {
        static let saved = "readingList.saved"
        static let progress = "readingList.lastChapter"
    }

    /// Saved publication ids, most recently saved last.
    @Published private(set) var savedIDs: [String]
    /// Publication id -> the chapter id the reader last opened.
    @Published private(set) var lastChapterIDs: [String: String]

    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        savedIDs = defaults.stringArray(forKey: Key.saved) ?? []
        lastChapterIDs = defaults.dictionary(forKey: Key.progress) as? [String: String] ?? [:]
    }

    func isSaved(_ publicationID: String) -> Bool {
        savedIDs.contains(publicationID)
    }

    func toggleSaved(_ publicationID: String) {
        if let index = savedIDs.firstIndex(of: publicationID) {
            savedIDs.remove(at: index)
        } else {
            savedIDs.append(publicationID)
        }
        defaults.set(savedIDs, forKey: Key.saved)
    }

    func lastChapterID(for publicationID: String) -> String? {
        lastChapterIDs[publicationID]
    }

    func recordOpened(chapterID: String, in publicationID: String) {
        lastChapterIDs[publicationID] = chapterID
        defaults.set(lastChapterIDs, forKey: Key.progress)
    }

    /// Forgets a publication entirely — used when it leaves the catalog.
    func forget(_ publicationID: String) {
        savedIDs.removeAll { $0 == publicationID }
        lastChapterIDs.removeValue(forKey: publicationID)
        defaults.set(savedIDs, forKey: Key.saved)
        defaults.set(lastChapterIDs, forKey: Key.progress)
    }
}
