import SwiftUI

@main
struct RNRNewLifeApp: App {
    @StateObject private var library = LibraryStore()
    @StateObject private var readingList = ReadingListStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(library)
                .environmentObject(readingList)
        }
    }
}
