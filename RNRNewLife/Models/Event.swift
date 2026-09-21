import Foundation

/// A scheduled event shown on the schedule screen.
struct Event: Identifiable, Codable, Equatable {
    let id: String
    let title: String
    let details: String
    let startsAt: Date
    let durationMinutes: Int
    let location: String

    var endsAt: Date {
        startsAt.addingTimeInterval(TimeInterval(durationMinutes) * 60)
    }

    /// An event counts as upcoming until it has finished.
    func isUpcoming(asOf now: Date) -> Bool {
        endsAt > now
    }
}

/// One day of the schedule, with the events happening on it.
struct EventDay: Identifiable, Equatable {
    let day: Date
    let events: [Event]

    var id: Date { day }
}

extension Array where Element == Event {
    /// Events that have not finished yet, soonest first.
    func upcoming(asOf now: Date, calendar: Calendar = .current) -> [Event] {
        filter { $0.isUpcoming(asOf: now) }
            .sorted { $0.startsAt < $1.startsAt }
    }

    /// Upcoming events grouped by calendar day, in chronological order.
    func groupedByDay(asOf now: Date, calendar: Calendar = .current) -> [EventDay] {
        let grouped = Dictionary(grouping: upcoming(asOf: now, calendar: calendar)) { event in
            calendar.startOfDay(for: event.startsAt)
        }
        return grouped
            .map { EventDay(day: $0.key, events: $0.value.sorted { $0.startsAt < $1.startsAt }) }
            .sorted { $0.day < $1.day }
    }
}
