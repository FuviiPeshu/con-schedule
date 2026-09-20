import { describe, expect, it } from "vitest";

import { formatEventTime, isEventLive } from "./dateTime.utils";

describe("Utils / formatEventTime", () => {
    it("should format summer UTC time in the configured convention timezone", () => {
        expect(formatEventTime("2026-08-20T14:50:00Z")).toBe("16:50");
    });

    it("should format winter UTC time with the configured timezone offset", () => {
        expect(formatEventTime("2026-01-15T14:50:00Z")).toBe("15:50");
    });
});

describe("Utils / isEventLive", () => {
    const start = "2026-08-20T16:00:00+02:00";
    const end = "2026-08-20T17:00:00+02:00";

    it("should return true when now is inside the event interval", () => {
        expect(isEventLive(start, end, new Date("2026-08-20T16:30:00+02:00"))).toBe(true);
    });

    it("should include the start and end boundaries", () => {
        expect(isEventLive(start, end, new Date(start))).toBe(true);
        expect(isEventLive(start, end, new Date(end))).toBe(true);
    });

    it("should return false outside the event interval", () => {
        expect(isEventLive(start, end, new Date("2026-08-20T15:59:59+02:00"))).toBe(false);
        expect(isEventLive(start, end, new Date("2026-08-20T17:00:01+02:00"))).toBe(false);
    });

    it("should return false when either range time is missing", () => {
        const now = new Date("2026-08-20T16:30:00+02:00");

        expect(isEventLive(null, end, now)).toBe(false);
        expect(isEventLive(start, null, now)).toBe(false);
    });
});
