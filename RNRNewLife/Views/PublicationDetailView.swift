import SwiftUI

struct PublicationDetailView: View {
    @EnvironmentObject private var readingList: ReadingListStore
    let publication: Publication

    private var resumeChapter: Chapter? {
        guard let id = readingList.lastChapterID(for: publication.id) else { return nil }
        return publication.chapters.first { $0.id == id }
    }

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text(publication.title).font(.title2.bold())
                    if !publication.author.isEmpty {
                        Text(publication.author).foregroundStyle(.secondary)
                    }
                    Text(publication.summary).font(.body)
                    Text("\(publication.estimatedReadingMinutes) min read · \(publication.language)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            }

            if let resumeChapter {
                Section {
                    NavigationLink {
                        ReaderView(publication: publication, chapter: resumeChapter)
                    } label: {
                        Label("Continue “\(resumeChapter.title)”", systemImage: "arrow.forward.circle")
                    }
                }
            }

            Section("Chapters") {
                ForEach(publication.chapters) { chapter in
                    NavigationLink {
                        ReaderView(publication: publication, chapter: chapter)
                    } label: {
                        Text(chapter.title)
                    }
                }
            }
        }
        .navigationTitle(publication.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    readingList.toggleSaved(publication.id)
                } label: {
                    Label(
                        readingList.isSaved(publication.id) ? "Saved" : "Save",
                        systemImage: readingList.isSaved(publication.id) ? "bookmark.fill" : "bookmark"
                    )
                }
            }
        }
    }
}
