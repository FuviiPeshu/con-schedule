import { describe, expect, it } from "vitest";

import {
    EXAMPLE_EVENT_MOCK_DATA,
    OTHER_EXAMPLE_EVENT_MOCK_DATA,
} from "../__mocks__/schedule.mocks";
import type { ScheduleFilters } from "../schedule.types";
import {
    emptyFilters,
    eventMatchesFilters,
    getEventDate,
    getEventSearchText,
    getFilterOptions,
    uniqueOptions,
    uniqueValues,
    UNSCHEDULED_FILTER,
} from "./scheduleFilters.utils";

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

describe("Utils / Schedule Filters", () => {
    it("should return only unique, sorted values and options", () => {
        expect(uniqueValues(["Room B", "", "Room A", "Room B"])).toEqual(["Room A", "Room B"]);
        expect(
            uniqueOptions([
                { value: "b", label: "Zulu" },
                { value: "", label: "Empty" },
                { value: "a", label: "Alpha" },
                { value: "b", label: "Beta" },
            ])
        ).toEqual([
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
        ]);
    });

    it("should build filter options from event fields and handles missing dates", () => {
        const eventWithoutDate = { ...loungeEvent, start: null };
        const options = getFilterOptions([openingEvent, loungeEvent, eventWithoutDate]);

        expect(getEventDate(eventWithoutDate)).toBe("");
        expect(options.room).toEqual([
            { value: "Auditorium", label: "Auditorium" },
            { value: "Fursuit Lounge", label: "Fursuit Lounge" },
        ]);
        expect(options.date).toEqual([
            { value: "2026-08-20", label: "2026-08-20" },
            { value: "2026-08-21", label: "2026-08-21" },
            { value: UNSCHEDULED_FILTER.value, label: UNSCHEDULED_FILTER.label },
        ]);
        expect(options.tag).toEqual([
            { value: "EF-Services", label: "EF-Services" },
            { value: "Information", label: "Information" },
        ]);
        expect(options.speaker).toEqual([
            { value: "SPEAK1", label: "Conops" },
            { value: "SPEAK2", label: "John Eurofurence" },
        ]);
    });

    it("should omit null search values instead of indexing the word null", () => {
        const eventWithMissingSearchValues = {
            ...openingEvent,
            title: null,
            speakers: [{ ...openingEvent.speakers[0], name: null }],
            tags: [{ ...openingEvent.tags[0], tag: null }],
        } as unknown as typeof openingEvent;

        expect(getEventSearchText(eventWithMissingSearchValues)).not.toContain("null");
    });

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

    it("should filter unscheduled events by the unscheduled date option", () => {
        const eventWithoutDate = { ...loungeEvent, start: null };

        expect(
            eventMatchesFilters(eventWithoutDate, withFilters({ date: UNSCHEDULED_FILTER.value }))
        ).toBe(true);
        expect(
            eventMatchesFilters(loungeEvent, withFilters({ date: UNSCHEDULED_FILTER.value }))
        ).toBe(false);
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

    it("should assign after-midnight events to the schedule day they belong to", () => {
        const afterMidnightEvent = {
            ...openingEvent,
            start: "2026-08-21T02:00:00+02:00",
            end: "2026-08-21T03:00:00+02:00",
        };

        expect(getEventDate(afterMidnightEvent)).toBe("2026-08-20");
        expect(eventMatchesFilters(afterMidnightEvent, withFilters({ date: "2026-08-20" }))).toBe(
            true
        );
        expect(eventMatchesFilters(afterMidnightEvent, withFilters({ date: "2026-08-21" }))).toBe(
            false
        );
        expect(getFilterOptions([afterMidnightEvent]).date).toEqual([
            { value: "2026-08-20", label: "2026-08-20" },
        ]);
    });

    it("should treat regular expression characters in the search as plain text", () => {
        expect(eventMatchesFilters(openingEvent, withFilters({ search: ".*" }))).toBe(false);
        expect(eventMatchesFilters(openingEvent, withFilters({ search: "(opening" }))).toBe(false);
    });
});
