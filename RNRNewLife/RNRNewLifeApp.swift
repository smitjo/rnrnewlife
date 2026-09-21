import SwiftUI

@main
struct RNRNewLifeApp: App {
    @StateObject private var store = ContentStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
        }
    }
}
