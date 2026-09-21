import SwiftUI

struct ScheduleView: View {
    @EnvironmentObject private var store: ContentStore

    var body: some View {
        NavigationStack {
            List {
                let days = store.scheduleByDay()
                if days.isEmpty {
                    ContentUnavailableView(
                        "No upcoming events",
                        systemImage: "calendar.badge.exclamationmark",
                        description: Text("Check back soon for the next schedule.")
                    )
                } else {
                    ForEach(days) { day in
                        Section(day.day.formatted(.dateTime.weekday(.wide).month().day())) {
                            ForEach(day.events) { event in
                                EventRow(event: event)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Schedule")
            .refreshable { store.load() }
        }
    }
}

struct EventRow: View {
    let event: Event

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(event.title).font(.headline)
            Text("\(event.startsAt.formatted(date: .omitted, time: .shortened)) – \(event.endsAt.formatted(date: .omitted, time: .shortened))")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            if !event.location.isEmpty {
                Label(event.location, systemImage: "mappin.and.ellipse")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            if !event.details.isEmpty {
                Text(event.details).font(.footnote)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ScheduleView().environmentObject(ContentStore.preview)
}
