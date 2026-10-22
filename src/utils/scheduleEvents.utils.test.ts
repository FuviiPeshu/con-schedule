import { describe, expect, it } from "vitest";

import {
    EXAMPLE_EVENT_MOCK_DATA,
    OTHER_EXAMPLE_EVENT_MOCK_DATA,
} from "../__mocks__/schedule.mocks";
import {
    eventOverlapsScheduleDay,
    formatDayKey,
    getCalendarDays,
    getCalendarRooms,
    getCompactEventRows,
    getPositionedEvents,
} from "./scheduleEvents.utils";
import { UNSCHEDULED_FILTER } from "./scheduleFilters.utils";

const opening = EXAMPLE_EVENT_MOCK_DATA;
const lounge = OTHER_EXAMPLE_EVENT_MOCK_DATA;

describe("Utils / getCompactEventRows", () => {
    it("should group consecutive events that start at the same time on the same day", () => {
        const sameStart = { ...opening, id: 1, room: { id: 2, name: "Second Room" } };
        const later = { ...opening, id: 2, start: "2026-08-20T18:00:00+02:00" };

        const rows = getCompactEventRows([opening, sameStart, later]);

        expect(rows.map((row) => row.timeLabel)).toEqual(["16:50", "18:00"]);
        expect(rows[0].events).toEqual([opening, sameStart]);
        expect(rows[0].dayKey).toBe("2026-08-20");
    });

    it("should not merge events with the same clock time on different days", () => {
        const nextDay = {
            ...opening,
            id: 3,
            start: "2026-08-21T16:50:00+02:00",
            end: "2026-08-21T17:20:00+02:00",
        };

        const rows = getCompactEventRows([opening, nextDay]);

        expect(rows).toHaveLength(2);
        expect(rows.map((row) => row.dayKey)).toEqual(["2026-08-20", "2026-08-21"]);
    });

    it("should only merge neighbouring events, keeping the input order", () => {
        const interleaved = { ...opening, id: 4, start: "2026-08-20T18:00:00+02:00" };

        const rows = getCompactEventRows([opening, interleaved, { ...opening, id: 5 }]);

        expect(rows.map((row) => row.timeLabel)).toEqual(["16:50", "18:00", "16:50"]);
    });

    it("should collect unscheduled events into TBD rows labelled Unscheduled", () => {
        const first = { ...opening, id: 6, start: null, end: null };
        const second = { ...opening, id: 7, start: null, end: null };

        const rows = getCompactEventRows([first, second]);

        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({
            dayKey: UNSCHEDULED_FILTER.value,
            dayLabel: UNSCHEDULED_FILTER.label,
            timeLabel: "TBD",
        });
        expect(rows[0].events).toHaveLength(2);
    });
});

describe("Utils / formatDayKey", () => {
    it("should format schedule days and the unscheduled bucket", () => {
        expect(formatDayKey("2026-08-20")).toBe("Thursday, Aug\u00A020");
        expect(formatDayKey(UNSCHEDULED_FILTER.value)).toBe(UNSCHEDULED_FILTER.label);
    });
});

describe("Utils / getCalendarDays", () => {
    it("should count every event overlapping a day, including ones continuing past the boundary", () => {
        const days = getCalendarDays([opening, lounge]);

        expect(days.map((day) => [day.value, day.eventsCount])).toEqual([
            ["2026-08-20", 1],
            ["2026-08-21", 1],
        ]);
    });

    it("should ignore unscheduled events and return nothing for an empty list", () => {
        expect(getCalendarDays([{ ...opening, start: null, end: null }])).toEqual([]);
        expect(getCalendarDays([])).toEqual([]);
    });

    it("should place events that end before the day start on the previous day", () => {
        const earlyMorning = {
            ...opening,
            start: "2026-08-21T02:00:00+02:00",
            end: "2026-08-21T04:00:00+02:00",
        };

        expect(getCalendarDays([earlyMorning]).map((day) => day.value)).toEqual(["2026-08-20"]);
        expect(getCalendarDays([opening, earlyMorning, lounge]).map((day) => day.value)).toEqual([
            "2026-08-20",
            "2026-08-21",
        ]);
    });

    it("should fall back to the duration when an event has no end time", () => {
        const noEnd = {
            ...opening,
            start: "2026-08-21T05:30:00+02:00",
            end: null,
            duration: 60,
        };

        expect(getCalendarDays([noEnd]).map((day) => day.value)).toEqual([
            "2026-08-20",
            "2026-08-21",
        ]);
    });
});

describe("Utils / eventOverlapsScheduleDay", () => {
    it("should include events crossing the day start boundary but not ones ending exactly at it", () => {
        const crossesBoundary = {
            ...opening,
            start: "2026-08-21T05:00:00+02:00",
            end: "2026-08-21T09:00:00+02:00",
        };
        const endsAtBoundary = {
            ...opening,
            start: "2026-08-21T04:00:00+02:00",
            end: "2026-08-21T06:00:00+02:00",
        };

        expect(eventOverlapsScheduleDay(crossesBoundary, "2026-08-21")).toBe(true);
        expect(eventOverlapsScheduleDay(endsAtBoundary, "2026-08-21")).toBe(false);
    });
});

describe("Utils / getCalendarRooms", () => {
    it("should return unique rooms sorted by name for the selected day only", () => {
        const rooms = getCalendarRooms(
            [lounge, { ...opening, id: 10, room: { id: 3, name: "Zeta" } }, opening, opening],
            "2026-08-20"
        );

        expect(rooms.map((room) => room.value)).toEqual(["Auditorium", "Zeta"]);
    });
});

describe("Utils / getPositionedEvents", () => {
    it("should skip events in rooms that are not part of the visible rooms", () => {
        const secondRoomEvent = { ...opening, id: 12, room: { id: 2, name: "Second Room" } };
        const visibleRooms = [{ value: "Second Room", label: "Second Room" }];

        const positioned = getPositionedEvents(
            [opening, secondRoomEvent],
            "2026-08-20",
            visibleRooms
        );

        expect(positioned.map((item) => item.event.id)).toEqual([12]);
        expect(positioned[0].roomIndex).toBe(0);
    });

    it("should order events by room, then start time", () => {
        const earlierInSecondRoom = {
            ...opening,
            id: 11,
            room: { id: 2, name: "Second Room" },
            start: "2026-08-20T10:00:00+02:00",
            end: "2026-08-20T10:30:00+02:00",
        };

        const positioned = getPositionedEvents([earlierInSecondRoom, opening], "2026-08-20");

        expect(positioned.map((item) => item.event.id)).toEqual([opening.id, 11]);
    });

    it("should give events without an end at least a half-hour slot", () => {
        const shortNoEnd = { ...opening, end: null, duration: 10 };

        const [positioned] = getPositionedEvents([shortNoEnd], "2026-08-20");

        expect(positioned.endMinute - positioned.startMinute).toBe(30);
    });

    it("should clip nothing and keep offsets past the day boundary for overnight events", () => {
        const [positioned] = getPositionedEvents([lounge], "2026-08-21");

        expect(positioned.startMinute).toBe(4 * 60);
        expect(positioned.endMinute).toBe(20 * 60);
    });
});
