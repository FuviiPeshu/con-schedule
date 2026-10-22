import { describe, expect, it } from "vitest";

import {
    getEventLinkProps,
    getScheduleLinkProps,
    isOpenedFromSchedule,
    isScheduleReset,
} from "./navigation.utils";

describe("Utils / Navigation", () => {
    it("should recognise supported navigation state flags", () => {
        expect(isOpenedFromSchedule({ fromSchedule: true })).toBe(true);
        expect(isOpenedFromSchedule({ fromSchedule: "true" })).toBe(false);
        expect(isOpenedFromSchedule(null)).toBe(false);
        expect(isOpenedFromSchedule(undefined)).toBe(false);
        expect(isOpenedFromSchedule("fromSchedule")).toBe(false);

        expect(isScheduleReset({ resetSchedule: true })).toBe(true);
        expect(isScheduleReset({ fromSchedule: true })).toBe(false);
        expect(isScheduleReset(undefined)).toBe(false);
    });

    it("should build event links that carry the schedule query and origin", () => {
        expect(getEventLinkProps(621, "?room=Auditorium&page=2")).toEqual({
            to: { pathname: "/event/621", search: "?room=Auditorium&page=2" },
            state: { fromSchedule: true },
        });
    });

    it("should return to the exact schedule position when opened from the schedule", () => {
        expect(getScheduleLinkProps({ fromSchedule: true }, "?date=2026-08-20", "?page=1")).toEqual(
            {
                to: { pathname: "/", search: "?date=2026-08-20" },
                state: { fromSchedule: true },
            }
        );
    });

    it("should reset schedule and use the fallback query when opened directly", () => {
        expect(getScheduleLinkProps(null, "?ignored=1", "?page=1")).toEqual({
            to: { pathname: "/", search: "?page=1" },
            state: { resetSchedule: true },
        });
    });
});
