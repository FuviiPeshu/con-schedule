import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    EXAMPLE_EVENT_MOCK_DATA,
    OTHER_EXAMPLE_EVENT_MOCK_DATA,
} from "../__mocks__/schedule.mocks";
import { useCalendarSchedule } from "./useCalendarSchedule";

const opening = EXAMPLE_EVENT_MOCK_DATA; // 2026-08-20
const lounge = OTHER_EXAMPLE_EVENT_MOCK_DATA; // 2026-08-21

const setup = (
    selectedDay: string,
    options: { events?: (typeof opening)[]; filteredEvents?: (typeof opening)[] } = {}
) => {
    const events = options.events ?? [opening, lounge];
    const filteredEvents = options.filteredEvents ?? events;
    const updateSearchParams = vi.fn();
    const hook = renderHook(() =>
        useCalendarSchedule({ events, filteredEvents, selectedDay, updateSearchParams })
    );

    return { ...hook, updateSearchParams };
};

const applyLastUpdate = (
    updateSearchParams: ReturnType<typeof vi.fn>,
    query = ""
): URLSearchParams => {
    const params = new URLSearchParams(query);
    updateSearchParams.mock.calls[updateSearchParams.mock.calls.length - 1][0](params);
    return params;
};

describe("Hooks / useCalendarSchedule", () => {
    it("should keep a valid selected day without touching the URL", () => {
        const { result, updateSearchParams } = setup("2026-08-21");

        expect(result.current.activeDay).toBe("2026-08-21");
        expect(updateSearchParams).not.toHaveBeenCalled();
    });

    it("should select the first day and write it to the URL when none is selected", () => {
        const { result, updateSearchParams } = setup("");

        expect(result.current.activeDay).toBe("2026-08-20");

        const params = applyLastUpdate(updateSearchParams, "page=2");
        expect(params.get("date")).toBe("2026-08-20");
        expect(params.has("page")).toBe(false);
    });

    it("should replace an unknown day with the first day that matches the filters", () => {
        const { result, updateSearchParams } = setup("2030-01-01", { filteredEvents: [lounge] });

        expect(result.current.activeDay).toBe("2026-08-21");
        expect(applyLastUpdate(updateSearchParams).get("date")).toBe("2026-08-21");
    });

    it("should disable days without matching events but keep them listed", () => {
        const { result } = setup("2026-08-21", { filteredEvents: [lounge] });

        expect([...result.current.disabledCalendarDays]).toEqual(["2026-08-20"]);
        expect(result.current.calendarDays).toHaveLength(2);
    });

    it("should keep a shared day selected even when the filters leave it empty", () => {
        const { result, updateSearchParams } = setup("2026-08-20", { filteredEvents: [lounge] });

        expect(result.current.activeDay).toBe("2026-08-20");
        expect(updateSearchParams).not.toHaveBeenCalled();
    });

    it("should leave a shared day untouched while the schedule has no events yet", () => {
        const { result, updateSearchParams } = setup("2026-08-21", { events: [] });

        expect(result.current.activeDay).toBe("");
        expect(result.current.calendarDays).toEqual([]);
        expect(updateSearchParams).not.toHaveBeenCalled();
    });

    it("should select a day by setting the date and dropping the list page", () => {
        const { result, updateSearchParams } = setup("2026-08-20");

        result.current.setSelectedDay("2026-08-21");

        const params = applyLastUpdate(updateSearchParams, "page=3&room=Auditorium");
        expect(params.get("date")).toBe("2026-08-21");
        expect(params.has("page")).toBe(false);
        expect(params.get("room")).toBe("Auditorium");
    });
});
