import { describe, expect, it } from "vitest";

import { EXAMPLE_EVENT_MOCK_DATA } from "../__mocks__/schedule.mocks";
import { CalendarOrientation } from "../schedule.types";
import {
    getCalendarEventLayout,
    getCalendarGridLayout,
    getCalendarGridRooms,
    getCalendarHourMarks,
    getCalendarTimelineLayout,
} from "./calendarLayout.utils";
import { getCalendarRooms, getPositionedEvents } from "./scheduleEvents.utils";

const positionedEventOf = (startMinute: number, endMinute: number) => ({
    event: EXAMPLE_EVENT_MOCK_DATA,
    startMinute,
    endMinute,
    roomIndex: 0,
});

describe("Utils / Calendar layout", () => {
    const events = [EXAMPLE_EVENT_MOCK_DATA];
    const rooms = getCalendarRooms(events, "2026-08-20");
    const [positionedEvent] = getPositionedEvents(events, "2026-08-20", rooms);
    const timeline = getCalendarTimelineLayout([positionedEvent]);

    it("should add readable leading buffer and cover the final event", () => {
        expect(timeline).toEqual({
            timelineStartMinute: 570,
            timelineEndMinute: 1530,
            timelineHalfHours: 32,
        });
    });

    it("should position room-oriented events within resized columns", () => {
        const availableWidth = 500;
        const gridRooms = getCalendarGridRooms(rooms, availableWidth);
        const layout = getCalendarGridLayout({
            orientation: CalendarOrientation.Rooms,
            gridRooms,
            rooms,
            availableWidth,
            availableHeight: 400,
            roomWidthOverrides: { Auditorium: 320 },
            timelineHalfHours: timeline.timelineHalfHours,
        });

        expect(layout.roomColumnWidths).toEqual([320, 100]);
        expect(layout.roomColumnOffsets).toEqual([0, 320]);
        expect(
            getCalendarEventLayout(
                positionedEvent,
                CalendarOrientation.Rooms,
                timeline.timelineStartMinute,
                layout
            )
        ).toEqual({
            top: (80 / 60) * 100 + 2,
            height: 48,
            left: 2,
            width: 318,
        });
    });

    it("should fit final placeholder row and position time-oriented events", () => {
        const layout = getCalendarGridLayout({
            orientation: CalendarOrientation.Times,
            gridRooms: getCalendarGridRooms(rooms, 500),
            rooms,
            availableWidth: 500,
            availableHeight: 400,
            roomWidthOverrides: {},
            timelineHalfHours: timeline.timelineHalfHours,
        });

        expect(layout.calendarRowHeights).toEqual([112, 112, 112, 64]);
        expect(layout.calendarRowOffsets).toEqual([0, 112, 224, 336]);
        expect(
            getCalendarEventLayout(
                positionedEvent,
                CalendarOrientation.Times,
                timeline.timelineStartMinute,
                layout
            )
        ).toEqual({
            top: 2,
            height: 108,
            left: 194,
            width: 68,
        });
    });

    it("should stretch trailing placeholder column to fill the viewport exactly", () => {
        const layout = getCalendarGridLayout({
            orientation: CalendarOrientation.Rooms,
            gridRooms: getCalendarGridRooms(rooms, 1000),
            rooms,
            availableWidth: 1000,
            availableHeight: 400,
            roomWidthOverrides: {},
            timelineHalfHours: timeline.timelineHalfHours,
        });

        expect(layout.roomColumnWidths).toEqual([256, 256, 256, 152]);
        expect(layout.calendarWidth).toBe(1000);
    });

    it("should not let placeholder columns add scrolling when room is widened past the viewport", () => {
        const layout = getCalendarGridLayout({
            orientation: CalendarOrientation.Rooms,
            gridRooms: getCalendarGridRooms(rooms, 900),
            rooms,
            availableWidth: 900,
            availableHeight: 400,
            roomWidthOverrides: { Auditorium: 560 },
            timelineHalfHours: timeline.timelineHalfHours,
        });

        expect(layout.roomColumnWidths).toEqual([560, 256, 4, 0]);
        expect(layout.calendarWidth).toBe(900);

        const wider = getCalendarGridLayout({
            orientation: CalendarOrientation.Rooms,
            gridRooms: getCalendarGridRooms(rooms, 500),
            rooms,
            availableWidth: 500,
            availableHeight: 400,
            roomWidthOverrides: { Auditorium: 560 },
            timelineHalfHours: timeline.timelineHalfHours,
        });

        expect(wider.calendarWidth).toBe(80 + 560);
    });

    it("should keep minimum column widths and overflow horizontally on narrow viewports", () => {
        const layout = getCalendarGridLayout({
            orientation: CalendarOrientation.Rooms,
            gridRooms: getCalendarGridRooms(rooms, 200),
            rooms,
            availableWidth: 200,
            availableHeight: 400,
            roomWidthOverrides: {},
            timelineHalfHours: timeline.timelineHalfHours,
        });

        expect(layout.roomColumnWidths[0]).toBe(256);
        expect(layout.calendarWidth).toBeGreaterThan(200);
    });
});

describe("Utils / getCalendarGridRooms", () => {
    const room = (name: string) => ({ value: name, label: name });

    it("should only list given rooms when the viewport is not measured yet", () => {
        expect(getCalendarGridRooms([room("Second Room")], 0).map((r) => r.value)).toEqual([
            "Second Room",
        ]);
    });

    it("should add placeholder columns to fill a partial calendar width", () => {
        expect(getCalendarGridRooms([room("Auditorium")], 600).map((r) => r.value)).toEqual([
            "Auditorium",
            "__empty-room-0",
            "__empty-room-1",
        ]);
    });
});

describe("Utils / getCalendarTimelineLayout", () => {
    it("should provide full-day fallback window when there are no events", () => {
        expect(getCalendarTimelineLayout([])).toEqual({
            timelineStartMinute: -30,
            timelineEndMinute: 1440,
            timelineHalfHours: 49,
        });
    });

    it("should extend past minimum window for events ending late", () => {
        const lateEvent = { ...positionedEventOf(100, 2000), roomIndex: 0 };

        expect(getCalendarTimelineLayout([lateEvent])).toMatchObject({
            timelineStartMinute: 30,
            timelineEndMinute: 2040,
        });
    });

    it("should begin before the day start for events carried over from the previous day", () => {
        const earlyEvent = positionedEventOf(-45, 60);

        expect(getCalendarTimelineLayout([earlyEvent]).timelineStartMinute).toBe(-90);
    });
});

describe("Utils / getCalendarHourMarks", () => {
    it("should mark full hours only, skipping the half-hour buffer", () => {
        const marks = getCalendarHourMarks(570, 32);

        expect(marks).toHaveLength(16);
        expect(marks[0]).toEqual({ halfHour: 1, offsetMinutes: 600 });
        expect(marks[marks.length - 1]).toEqual({ halfHour: 31, offsetMinutes: 1500 });
        expect(marks.every((mark) => mark.offsetMinutes % 60 === 0)).toBe(true);
    });

    it("should include hours that fall before the day start", () => {
        expect(getCalendarHourMarks(-90, 6).map((mark) => mark.offsetMinutes)).toEqual([
            -60, 0, 60,
        ]);
    });
});
