import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EventState } from "../schedule.types";
import {
    formatCountdown,
    formatEventDate,
    formatEventDuration,
    formatEventTime,
    formatScheduleDay,
    getEventLocalMinutes,
    getEventState,
    getFeedState,
    getScheduleDayKey,
    getScheduleMinuteOffset,
    isEventLive,
    parseConventionDate,
} from "./dateTime.utils";

describe("Utils / Header Helpers (convention lifecycle utils)", () => {
    it("should convert a convention date in the configured timezone", () => {
        expect(parseConventionDate("2027-08-18").toISOString()).toBe("2027-08-17T22:00:00.000Z");
    });

    it("should resolve countdown, online, and offline states properly", () => {
        expect(getFeedState(new Date("2027-08-17T21:59:59Z"), "2027-08-18", "2027-08-22")).toBe(
            "Countdown"
        );
        expect(getFeedState(new Date("2027-08-18T00:00:00Z"), "2027-08-18", "2027-08-22")).toBe(
            "Live"
        );
        expect(getFeedState(new Date("2027-08-22T22:00:01Z"), "2027-08-18", "2027-08-22")).toBe(
            "Archive"
        );
    });

    it("should format a countdown with days and a clock", () => {
        expect(
            formatCountdown(new Date("2027-08-18T00:00:00Z"), new Date("2027-08-17T21:59:55Z"))
        ).toBe("T-0d 02:00:05");
    });
});

describe("Utils / formatEventTime", () => {
    it("should format summer UTC time in the configured convention timezone", () => {
        expect(formatEventTime("2026-08-20T14:50:00Z")).toBe("16:50");
    });

    it("should format winter UTC time with the configured timezone offset", () => {
        expect(formatEventTime("2026-01-15T14:50:00Z")).toBe("15:50");
    });
});

describe("Utils / formatEventDuration", () => {
    it("should express duration in hours and remaining minutes", () => {
        expect(formatEventDuration(30)).toBe("30m");
        expect(formatEventDuration(60)).toBe("1h");
        expect(formatEventDuration(270)).toBe("4h 30m");
    });
});

describe("Utils / getScheduleDayKey", () => {
    it("should assign local times before and at the convention-day boundary correctly", () => {
        expect(getScheduleDayKey("2026-08-20T03:59:00Z")).toBe("2026-08-19");
        expect(getScheduleDayKey("2026-08-20T04:00:00Z")).toBe("2026-08-20");
    });

    it("should apply the configured timezone when resolving winter boundaries", () => {
        expect(getScheduleDayKey("2026-01-15T04:59:00Z")).toBe("2026-01-14");
        expect(getScheduleDayKey("2026-01-15T05:00:00Z")).toBe("2026-01-15");
    });

    it("should respect a custom day start time", () => {
        expect(getScheduleDayKey("2026-08-20T04:59:00Z", "07:00")).toBe("2026-08-19");
        expect(getScheduleDayKey("2026-08-20T05:00:00Z", "07:00")).toBe("2026-08-20");
    });
});

describe("Utils / getScheduleMinuteOffset", () => {
    it("should calculate offsets from the convention-day start", () => {
        expect(getScheduleMinuteOffset("2026-08-20T04:00:00Z", "2026-08-20")).toBe(0);
        expect(getScheduleMinuteOffset("2026-08-20T04:30:00Z", "2026-08-20")).toBe(30);
        expect(getScheduleMinuteOffset("2026-08-20T03:30:00Z", "2026-08-20")).toBe(-30);
    });

    it("should preserve the offset across a convention-day boundary", () => {
        expect(getScheduleMinuteOffset("2026-08-22T06:00:00Z", "2026-08-20")).toBe(3000);
    });

    it("should respect a custom convention-day start time", () => {
        expect(getScheduleMinuteOffset("2026-08-20T06:00:00Z", "2026-08-20", "07:00")).toBe(60);
    });
});

describe("Utils / isEventLive", () => {
    const start = "2026-08-20T16:00:00+02:00";
    const end = "2026-08-20T17:00:00+02:00";

    it("should return 'true' when now is inside the event interval", () => {
        expect(isEventLive(start, end, new Date("2026-08-20T16:30:00+02:00"))).toBe(true);
    });

    it("should include the start and end boundaries", () => {
        expect(isEventLive(start, end, new Date(start))).toBe(true);
        expect(isEventLive(start, end, new Date(end))).toBe(true);
    });

    it("should return 'false' outside the event interval", () => {
        expect(isEventLive(start, end, new Date("2026-08-20T15:59:59+02:00"))).toBe(false);
        expect(isEventLive(start, end, new Date("2026-08-20T17:00:01+02:00"))).toBe(false);
    });

    it("should return 'false' when either range time is missing", () => {
        const nowMock = new Date("2026-08-20T16:30:00+02:00");

        expect(isEventLive(null, end, nowMock)).toBe(false);
        expect(isEventLive(start, null, nowMock)).toBe(false);
    });
});

describe("Utils / getEventState", () => {
    const nowMock = new Date("2026-08-20T16:30:00+02:00");

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(nowMock);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return Live while an event is in progress", () => {
        expect(getEventState("2026-08-20T16:00:00+02:00", "2026-08-20T17:00:00+02:00")).toBe(
            EventState.Live
        );
    });

    it("should treat event start and end boundaries as live", () => {
        const start = "2026-08-20T16:00:00+02:00";
        const end = "2026-08-20T17:00:00+02:00";

        vi.setSystemTime(new Date(start));
        expect(getEventState(start, end)).toBe(EventState.Live);

        vi.setSystemTime(new Date(end));
        expect(getEventState(start, end)).toBe(EventState.Live);
    });

    it("should return Upcoming before an event starts", () => {
        expect(getEventState("2026-08-20T17:00:00+02:00", "2026-08-20T18:00:00+02:00")).toBe(
            EventState.Upcoming
        );
    });

    it("should return Finished after an event ends", () => {
        expect(getEventState("2026-08-20T14:00:00+02:00", "2026-08-20T16:00:00+02:00")).toBe(
            EventState.Finished
        );
    });

    it("should return Unknown when the event range is incomplete", () => {
        expect(getEventState(null, null)).toBe(EventState.Unknown);
        expect(getEventState("2026-08-20T16:00:00+02:00", null)).toBe(EventState.Unknown);
        expect(getEventState(null, "2026-08-20T17:00:00+02:00")).toBe(EventState.Unknown);
    });
});

describe("Utils / getEventLocalMinutes", () => {
    it("should return minutes since local midnight in the configured timezone", () => {
        expect(getEventLocalMinutes("2026-08-20T14:50:00Z")).toBe(16 * 60 + 50);
        expect(getEventLocalMinutes("2026-08-20T22:30:00Z")).toBe(30);
    });
});

describe("Utils / day labels", () => {
    it("should keep day number attached to the month", () => {
        expect(formatScheduleDay("2026-08-20")).toBe("Thursday, Aug\u00A020");
        expect(formatEventDate("2026-08-20T14:50:00Z")).toBe("Thursday, Aug\u00A020");
    });

    it("should label events by their local date rather than the UTC date", () => {
        expect(formatEventDate("2026-08-20T22:30:00Z")).toBe("Friday, Aug\u00A021");
    });
});

describe("Utils / formatCountdown edge cases", () => {
    it("should never go below zero once the target has passed", () => {
        expect(
            formatCountdown(new Date("2027-08-18T00:00:00Z"), new Date("2027-08-18T00:00:05Z"))
        ).toBe("T-0d 00:00:00");
    });

    it("should round partial seconds up", () => {
        expect(
            formatCountdown(new Date("2027-08-18T00:00:00.500Z"), new Date("2027-08-18T00:00:00Z"))
        ).toBe("T-0d 00:00:01");
    });
});

describe("Utils / getFeedState edge cases", () => {
    it("should stay live when no start or end is configured", () => {
        expect(getFeedState(new Date("2027-01-01T00:00:00Z"), null, null)).toBe("Live");
    });

    it("should treat final millisecond of the end day as live", () => {
        expect(getFeedState(new Date("2027-08-22T21:59:59.999Z"), "2027-08-18", "2027-08-22")).toBe(
            "Live"
        );
    });
});
