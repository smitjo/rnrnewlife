import SwiftUI

struct RootView: View {
    @EnvironmentObject private var library: LibraryStore

    var body: some View {
        TabView {
            LibraryView()
                .tabItem { Label("Library", systemImage: "books.vertical") }

            SavedView()
                .tabItem { Label("Saved", systemImage: "bookmark") }

            AboutView()
                .tabItem { Label("About", systemImage: "info.circle") }
        }
        .onAppear { library.loadIfNeeded() }
    }
}

#Preview {
    RootView()
        .environmentObject(LibraryStore.preview)
        .environmentObject(ReadingListStore())
}
