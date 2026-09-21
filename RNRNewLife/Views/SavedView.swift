import SwiftUI

struct SavedView: View {
    @EnvironmentObject private var library: LibraryStore
    @EnvironmentObject private var readingList: ReadingListStore

    var body: some View {
        NavigationStack {
            List {
                let saved = library.publications(ids: readingList.savedIDs)

                if saved.isEmpty {
                    ContentUnavailableView(
                        "Nothing saved",
                        systemImage: "bookmark",
                        description: Text("Tap the bookmark on any publication to keep it here.")
                    )
                } else {
                    ForEach(saved) { publication in
                        NavigationLink {
                            PublicationDetailView(publication: publication)
                        } label: {
                            PublicationRow(publication: publication)
                        }
                    }
                    .onDelete { offsets in
                        for index in offsets {
                            readingList.toggleSaved(saved[index].id)
                        }
                    }
                }
            }
            .navigationTitle("Saved")
        }
    }
}

#Preview {
    SavedView()
        .environmentObject(LibraryStore.preview)
        .environmentObject(ReadingListStore())
}
