import Foundation

/// A single piece of reading material in the mission library.
struct Publication: Identifiable, Codable, Equatable {
    let id: String
    let title: String
    let author: String
    let category: String
    let summary: String
    let language: String
    let chapters: [Chapter]

    /// Total words across every chapter.
    var wordCount: Int {
        chapters.reduce(0) { $0 + $1.wordCount }
    }

    /// Rough reading time at 200 words per minute, never less than a minute.
    var estimatedReadingMinutes: Int {
        max(1, Int((Double(wordCount) / 200.0).rounded(.up)))
    }

    /// True when the query matches the title, author, category or summary.
    /// Matching ignores case and accents so "Espiritu" finds "Espíritu".
    func matches(query: String) -> Bool {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return true }
        return [title, author, category, summary].contains { field in
            field.range(of: trimmed, options: [.caseInsensitive, .diacriticInsensitive]) != nil
        }
    }
}

/// One chapter or section of a publication.
struct Chapter: Identifiable, Codable, Equatable {
    let id: String
    let title: String
    /// Body text, one entry per paragraph.
    let paragraphs: [String]

    var wordCount: Int {
        paragraphs.reduce(0) { total, paragraph in
            total + paragraph.split(whereSeparator: \.isWhitespace).count
        }
    }
}

/// A category heading in the library, with the publications filed under it.
struct LibrarySection: Identifiable, Equatable {
    let category: String
    let publications: [Publication]

    var id: String { category }
}

extension Array where Element == Publication {
    /// Publications matching the query, in the order they were given.
    func matching(query: String) -> [Publication] {
        filter { $0.matches(query: query) }
    }

    /// Publications grouped into sections by category. Categories are ordered
    /// alphabetically, and titles are ordered alphabetically within each one.
    func groupedByCategory() -> [LibrarySection] {
        Dictionary(grouping: self, by: \.category)
            .map { category, items in
                LibrarySection(
                    category: category,
                    publications: items.sorted {
                        $0.title.localizedStandardCompare($1.title) == .orderedAscending
                    }
                )
            }
            .sorted { $0.category.localizedStandardCompare($1.category) == .orderedAscending }
    }
}
