import { afterEach, describe, expect, it, vi } from "vitest";

import {
    EXAMPLE_EVENT_MOCK_DATA,
    OTHER_EXAMPLE_EVENT_MOCK_DATA,
    SCHEDULE_MOCK_DATA,
} from "../__mocks__/schedule.mocks";
import { apiBase } from "../configuration";
import { buildScheduleData, fetchSchedule } from "./api";
import type { EventSlot, ScheduleResponse } from "./api.types";

describe("API / fetchSchedule", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("should fetch and parse a successful schedule response", async () => {
        const json = vi.fn().mockResolvedValue(SCHEDULE_MOCK_DATA);
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
        const signal = new AbortController().signal;

        vi.stubGlobal("fetch", fetchMock);

        await expect(fetchSchedule(signal)).resolves.toBe(SCHEDULE_MOCK_DATA);
        expect(fetchMock).toHaveBeenCalledWith(apiBase, {
            signal,
            headers: { Accept: "application/json" },
        });
        expect(json).toHaveBeenCalledOnce();
    });

    it("should throw error for an unsuccessful response", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                status: 503,
                statusText: "Service Unavailable",
            })
        );

        await expect(fetchSchedule()).rejects.toThrow(
            "Schedule fetch failed: 503 Service Unavailable"
        );
    });
});

describe("API / buildScheduleData", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("should flatten days and sort events by start time with undated events last", () => {
        const undatedEvent: EventSlot = {
            ...EXAMPLE_EVENT_MOCK_DATA,
            id: 900,
            start: null,
            end: null,
        };
        const laterEvent: EventSlot = {
            ...OTHER_EXAMPLE_EVENT_MOCK_DATA,
            id: 901,
            start: "2026-08-20T18:00:00+02:00",
            end: "2026-08-20T18:30:00+02:00",
        };
        const earlierEvent: EventSlot = {
            ...EXAMPLE_EVENT_MOCK_DATA,
            id: 902,
            start: "2026-08-20T16:00:00+02:00",
            end: "2026-08-20T16:30:00+02:00",
        };
        const schedule: ScheduleResponse = {
            ...SCHEDULE_MOCK_DATA,
            days: [
                { ...SCHEDULE_MOCK_DATA.days[0], slots: [undatedEvent, laterEvent] },
                { ...SCHEDULE_MOCK_DATA.days[1], slots: [earlierEvent] },
            ],
        };

        expect(buildScheduleData(schedule).events.map((event) => event.id)).toEqual([
            902, 901, 900,
        ]);
    });

    it("should return empty event list for schedule without days", () => {
        expect(buildScheduleData({ ...SCHEDULE_MOCK_DATA, days: [] })).toEqual({ events: [] });
    });
});
