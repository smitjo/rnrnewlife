import XCTest
@testable import RNRNewLife

final class EventTests: XCTestCase {
    private func makeEvent(
        id: String,
        startsAt: Date,
        durationMinutes: Int = 60
    ) -> Event {
        Event(
            id: id,
            title: "Event \(id)",
            details: "",
            startsAt: startsAt,
            durationMinutes: durationMinutes,
            location: "Main hall"
        )
    }

    private var reference: Date {
        ISO8601DateFormatter().date(from: "2026-09-24T12:00:00Z")!
    }

    func testEndsAtUsesDuration() {
        let event = makeEvent(id: "e1", startsAt: reference, durationMinutes: 90)
        XCTAssertEqual(event.endsAt, reference.addingTimeInterval(90 * 60))
    }

    func testEventIsUpcomingUntilItEnds() {
        let event = makeEvent(id: "e1", startsAt: reference, durationMinutes: 60)
        XCTAssertTrue(event.isUpcoming(asOf: reference.addingTimeInterval(-60)))
        // In progress still counts as upcoming.
        XCTAssertTrue(event.isUpcoming(asOf: reference.addingTimeInterval(30 * 60)))
        XCTAssertFalse(event.isUpcoming(asOf: reference.addingTimeInterval(61 * 60)))
    }

    func testUpcomingDropsFinishedEventsAndSortsBySoonest() {
        let past = makeEvent(id: "past", startsAt: reference.addingTimeInterval(-24 * 3600))
        let later = makeEvent(id: "later", startsAt: reference.addingTimeInterval(4 * 3600))
        let sooner = makeEvent(id: "sooner", startsAt: reference.addingTimeInterval(2 * 3600))

        let result = [past, later, sooner].upcoming(asOf: reference)

        XCTAssertEqual(result.map(\.id), ["sooner", "later"])
    }

    func testGroupedByDayReturnsChronologicalDays() {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!

        let dayOne = makeEvent(id: "d1", startsAt: reference.addingTimeInterval(3 * 3600))
        let dayOneLater = makeEvent(id: "d1b", startsAt: reference.addingTimeInterval(6 * 3600))
        let dayTwo = makeEvent(id: "d2", startsAt: reference.addingTimeInterval(30 * 3600))

        let groups = [dayTwo, dayOneLater, dayOne].groupedByDay(asOf: reference, calendar: calendar)

        XCTAssertEqual(groups.count, 2)
        XCTAssertEqual(groups[0].events.map(\.id), ["d1", "d1b"])
        XCTAssertEqual(groups[1].events.map(\.id), ["d2"])
        XCTAssertLessThan(groups[0].day, groups[1].day)
    }

    func testGroupedByDayIsEmptyWhenEverythingHasFinished() {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!
        let past = makeEvent(id: "past", startsAt: reference.addingTimeInterval(-48 * 3600))

        XCTAssertTrue([past].groupedByDay(asOf: reference, calendar: calendar).isEmpty)
    }
}
