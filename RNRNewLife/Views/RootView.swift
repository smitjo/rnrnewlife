import SwiftUI

struct RootView: View {
    @EnvironmentObject private var store: ContentStore

    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Home", systemImage: "house") }

            ScheduleView()
                .tabItem { Label("Schedule", systemImage: "calendar") }

            AboutView()
                .tabItem { Label("About", systemImage: "info.circle") }
        }
        .onAppear { store.loadIfNeeded() }
    }
}

#Preview {
    RootView().environmentObject(ContentStore.preview)
}
