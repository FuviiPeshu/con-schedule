import { describe, expect, it } from "vitest";

import { EXAMPLE_EVENT_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import {
    eventOverlapsScheduleDay,
    getCalendarDays,
    getCalendarGridRooms,
    getCalendarRooms,
    getPositionedEvents,
} from "../../utils/scheduleEvents.utils";

describe("Components / CalendarView", () => {
    it("should place events in their room column", () => {
        const secondEvent = {
            ...EXAMPLE_EVENT_MOCK_DATA,
            id: EXAMPLE_EVENT_MOCK_DATA.id + 1,
            title: "Second same-hour event",
            start: "2026-08-20T16:55:00+02:00",
            end: "2026-08-20T17:25:00+02:00",
        };
        const positioned = getPositionedEvents(
            [EXAMPLE_EVENT_MOCK_DATA, secondEvent],
            "2026-08-20"
        );

        expect(positioned).toHaveLength(2);
        expect(positioned.every((event) => event.roomIndex === 0)).toBe(true);
    });

    it("should reuse room column for back-to-back events", () => {
        const nextEvent = {
            ...EXAMPLE_EVENT_MOCK_DATA,
            id: EXAMPLE_EVENT_MOCK_DATA.id + 3,
            title: "Back-to-back event",
            start: "2026-08-20T17:25:00+02:00",
            end: "2026-08-20T18:00:00+02:00",
        };
        const positioned = getPositionedEvents([EXAMPLE_EVENT_MOCK_DATA, nextEvent], "2026-08-20");

        expect(positioned.every((event) => event.roomIndex === 0)).toBe(true);
    });

    it("should use rooms as the primary calendar columns", () => {
        const secondRoomEvent = {
            ...EXAMPLE_EVENT_MOCK_DATA,
            id: EXAMPLE_EVENT_MOCK_DATA.id + 2,
            title: "Second room event",
            room: { id: 2, name: "Second Room" },
            start: "2026-08-20T16:55:00+02:00",
            end: "2026-08-20T17:25:00+02:00",
        };
        const rooms = getCalendarRooms([EXAMPLE_EVENT_MOCK_DATA, secondRoomEvent], "2026-08-20");
        const positioned = getPositionedEvents(
            [EXAMPLE_EVENT_MOCK_DATA, secondRoomEvent],
            "2026-08-20",
            rooms
        );

        expect(rooms.map((room) => room.value)).toEqual(["Auditorium", "Second Room"]);
        expect(new Set(positioned.map((event) => event.roomIndex)).size).toBe(2);
    });

    it("should remove hidden rooms from the grid column list", () => {
        const rooms = getCalendarRooms(
            [
                EXAMPLE_EVENT_MOCK_DATA,
                {
                    ...EXAMPLE_EVENT_MOCK_DATA,
                    id: EXAMPLE_EVENT_MOCK_DATA.id + 2,
                    room: { id: 2, name: "Second Room" },
                },
            ],
            "2026-08-20"
        );
        const visibleRooms = rooms.filter((room) => room.value !== "Auditorium");

        expect(getCalendarGridRooms(visibleRooms, 0).map((room) => room.value)).toEqual([
            "Second Room",
        ]);
    });

    it("should add placeholder columns to fill a partial calendar width", () => {
        const rooms = getCalendarRooms([EXAMPLE_EVENT_MOCK_DATA], "2026-08-20");

        expect(getCalendarGridRooms(rooms, 600).map((room) => room.value)).toEqual([
            "Auditorium",
            "__empty-room-0",
            "__empty-room-1",
        ]);
    });

    it("should expose unique selectable days in event order", () => {
        const days = getCalendarDays([
            EXAMPLE_EVENT_MOCK_DATA,
            { ...EXAMPLE_EVENT_MOCK_DATA, id: 622 },
            {
                ...EXAMPLE_EVENT_MOCK_DATA,
                id: 623,
                start: "2026-08-21T10:00:00+02:00",
                end: "2026-08-21T10:30:00+02:00",
            },
            {
                ...EXAMPLE_EVENT_MOCK_DATA,
                id: 624,
                start: "2026-08-21T02:00:00+02:00",
                end: "2026-08-21T04:00:00+02:00",
            },
        ]);

        expect(days.map((day) => day.value)).toEqual(["2026-08-20", "2026-08-21"]);
        expect(
            getCalendarDays([
                {
                    ...EXAMPLE_EVENT_MOCK_DATA,
                    id: 625,
                    start: "2026-08-21T02:00:00+02:00",
                    end: "2026-08-21T04:00:00+02:00",
                },
            ])[0].value
        ).toBe("2026-08-20");
    });

    it("should include events that cross the configured event day start boundary but exclude ones ending at it", () => {
        const crossesBoundary = {
            ...EXAMPLE_EVENT_MOCK_DATA,
            id: 626,
            start: "2026-08-21T05:00:00+02:00",
            end: "2026-08-21T09:00:00+02:00",
        };
        const endsAtBoundary = {
            ...EXAMPLE_EVENT_MOCK_DATA,
            id: 627,
            start: "2026-08-21T04:00:00+02:00",
            end: "2026-08-21T06:00:00+02:00",
        };

        expect(eventOverlapsScheduleDay(crossesBoundary, "2026-08-21")).toBe(true);
        expect(eventOverlapsScheduleDay(endsAtBoundary, "2026-08-21")).toBe(false);
    });
});
