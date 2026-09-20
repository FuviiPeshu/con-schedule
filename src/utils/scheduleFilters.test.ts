import { describe, expect, it } from "vitest";

import {
    EXAMPLE_EVENT_MOCK_DATA,
    OTHER_EXAMPLE_EVENT_MOCK_DATA,
} from "../__mocks__/schedule.mocks";
import type { ScheduleFilters } from "../schedule.types";
import { emptyFilters, eventMatchesFilters } from "./scheduleFilters.utils";

const openingEvent = EXAMPLE_EVENT_MOCK_DATA;
const loungeEvent = OTHER_EXAMPLE_EVENT_MOCK_DATA;
const searchableEvent = {
    ...openingEvent,
    raw_abstract: "mock-abstract-search-term",
    raw_description: "mock-description-search-term",
};

const withFilters = (filters: Partial<ScheduleFilters>): ScheduleFilters => ({
    ...emptyFilters,
    ...filters,
});

describe("Utils / schedule filters", () => {
    it("should match all events when no filters are selected", () => {
        expect(eventMatchesFilters(openingEvent, emptyFilters)).toBe(true);
        expect(eventMatchesFilters(loungeEvent, emptyFilters)).toBe(true);
    });

    it("should filter by room", () => {
        expect(eventMatchesFilters(openingEvent, withFilters({ room: "Auditorium" }))).toBe(true);
        expect(eventMatchesFilters(loungeEvent, withFilters({ room: "Auditorium" }))).toBe(false);
    });

    it("should filter by date", () => {
        expect(eventMatchesFilters(openingEvent, withFilters({ date: "2026-08-20" }))).toBe(true);
        expect(eventMatchesFilters(loungeEvent, withFilters({ date: "2026-08-20" }))).toBe(false);
    });

    it("should filter by tag", () => {
        expect(eventMatchesFilters(openingEvent, withFilters({ tag: "Information" }))).toBe(true);
        expect(eventMatchesFilters(loungeEvent, withFilters({ tag: "Information" }))).toBe(false);
    });

    it("should filter by speaker", () => {
        expect(eventMatchesFilters(openingEvent, withFilters({ speaker: "SPEAK2" }))).toBe(true);
        expect(eventMatchesFilters(loungeEvent, withFilters({ speaker: "SPEAK2" }))).toBe(false);
    });

    it.each([
        ["id", "621"],
        ["code", "6932DD"],
        ["raw abstract", "mock-abstract-search-term"],
        ["raw description", "mock-description-search-term"],
        ["room name", "Auditorium"],
        ["speaker name", "Conops"],
        ["tag name", "Information"],
        ["title", "Opening Ceremony"],
    ])("should match the event %s", (_field, search) => {
        expect(eventMatchesFilters(searchableEvent, withFilters({ search }))).toBe(true);
    });

    it("should not search HTML fields or identifier codes", () => {
        const event = {
            ...openingEvent,
            abstract: "html-only-abstract",
            description: "html-only-description",
            raw_abstract: "mock-abstract-search-term",
            raw_description: "mock-description-search-term",
        };

        expect(eventMatchesFilters(event, withFilters({ search: "html-only" }))).toBe(false);
        expect(eventMatchesFilters(event, withFilters({ search: "SPEAK1" }))).toBe(false);
    });

    it("should combine room and date filters", () => {
        expect(
            eventMatchesFilters(
                openingEvent,
                withFilters({ room: "Auditorium", date: "2026-08-20" })
            )
        ).toBe(true);
        expect(
            eventMatchesFilters(
                openingEvent,
                withFilters({ room: "Auditorium", date: "2026-08-21" })
            )
        ).toBe(false);
    });

    it("should combine tag and search filters", () => {
        expect(
            eventMatchesFilters(
                openingEvent,
                withFilters({ tag: "Information", search: "Opening Ceremony" })
            )
        ).toBe(true);
        expect(
            eventMatchesFilters(
                openingEvent,
                withFilters({ tag: "Information", search: "Fursuit Lounge" })
            )
        ).toBe(false);
    });
});
