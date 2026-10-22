import { describe, expect, it } from "vitest";

import { ScheduleView } from "../schedule.types";
import { resolveScheduleView } from "./scheduleView.utils";

const resolve = (query: string, options: { reset?: boolean; storedView?: ScheduleView } = {}) =>
    resolveScheduleView({
        searchParams: new URLSearchParams(query),
        reset: options.reset ?? false,
        storedView: options.storedView ?? ScheduleView.List,
    });

describe("Utils / resolveScheduleView", () => {
    it("should fall back to the stored view when the URL has no position", () => {
        expect(resolve("", { storedView: ScheduleView.Calendar })).toBe(ScheduleView.Calendar);
        expect(resolve("?room=Auditorium", { storedView: ScheduleView.List })).toBe(
            ScheduleView.List
        );
    });

    it("should open the calendar for a shared day even when the list was stored", () => {
        expect(resolve("?date=2026-08-21", { storedView: ScheduleView.List })).toBe(
            ScheduleView.Calendar
        );
    });

    it("should open the list for a page, with or without a day (FULL DAY)", () => {
        expect(resolve("?page=2", { storedView: ScheduleView.Calendar })).toBe(ScheduleView.List);
        expect(resolve("?date=2026-08-21&page=1", { storedView: ScheduleView.Calendar })).toBe(
            ScheduleView.List
        );
    });

    it("should always open the list on reset", () => {
        expect(
            resolve("?date=2026-08-21", { reset: true, storedView: ScheduleView.Calendar })
        ).toBe(ScheduleView.List);
    });
});
