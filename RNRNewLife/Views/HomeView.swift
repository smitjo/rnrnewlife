import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var store: ContentStore

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(store.content.siteName)
                            .font(.largeTitle.bold())
                        Text(store.content.tagline)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 8)
                }

                if let next = store.upcomingEvents().first {
                    Section("Next up") {
                        EventRow(event: next)
                    }
                }

                Section("Announcements") {
                    if store.sortedAnnouncements.isEmpty {
                        Text("Nothing new right now.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(store.sortedAnnouncements) { announcement in
                            AnnouncementRow(announcement: announcement)
                        }
                    }
                }

                if case .failed(let message) = store.state {
                    Section("Problem loading content") {
                        Text(message).foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("Home")
            .refreshable { store.load() }
        }
    }
}

private struct AnnouncementRow: View {
    let announcement: Announcement

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                if announcement.isPinned {
                    Image(systemName: "pin.fill")
                        .font(.caption)
                        .foregroundStyle(.tint)
                }
                Text(announcement.title).font(.headline)
            }
            Text(announcement.body).font(.subheadline)
            Text(announcement.publishedAt, format: .dateTime.month().day().year())
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    HomeView().environmentObject(ContentStore.preview)
}
