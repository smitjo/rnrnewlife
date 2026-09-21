import SwiftUI

struct LibraryView: View {
    @EnvironmentObject private var library: LibraryStore
    @State private var query = ""

    var body: some View {
        NavigationStack {
            List {
                let sections = library.sections(matching: query)

                if sections.isEmpty {
                    ContentUnavailableView(
                        query.isEmpty ? "Nothing to read yet" : "No matches",
                        systemImage: query.isEmpty ? "books.vertical" : "magnifyingglass",
                        description: Text(
                            query.isEmpty
                                ? "The library is empty."
                                : "No publication matches “\(query)”."
                        )
                    )
                } else {
                    ForEach(sections) { section in
                        Section(section.category) {
                            ForEach(section.publications) { publication in
                                NavigationLink(value: publication.id) {
                                    PublicationRow(publication: publication)
                                }
                            }
                        }
                    }
                }

                if case .failed(let message) = library.state {
                    Section("Problem loading the library") {
                        Text(message).foregroundStyle(.red)
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle(library.catalog.missionName)
            .navigationDestination(for: String.self) { id in
                if let publication = library.publication(id: id) {
                    PublicationDetailView(publication: publication)
                } else {
                    ContentUnavailableView("Not found", systemImage: "questionmark.folder")
                }
            }
            .searchable(text: $query, prompt: "Search titles and authors")
        }
    }
}

struct PublicationRow: View {
    let publication: Publication

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(publication.title).font(.headline)
            if !publication.author.isEmpty {
                Text(publication.author)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Text("\(publication.chapters.count) chapters · \(publication.estimatedReadingMinutes) min read")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    LibraryView()
        .environmentObject(LibraryStore.preview)
        .environmentObject(ReadingListStore())
}
