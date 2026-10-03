import type { EventSlot } from "../api";
import type { FilterOption, FilterOptions, ScheduleFilters } from "../schedule.types";
import { normalizeText } from "./text.utils";

export const emptyFilters: ScheduleFilters = {
    room: "",
    date: "",
    tag: "",
    speaker: "",
    search: "",
};

/** Returns an array of unique, non-empty, sorted string values */
export const uniqueValues = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort((first, second) => first.localeCompare(second));

/** Returns an array of unique, non-empty, sorted filter options */
export const uniqueOptions = (options: FilterOption[]) => {
    const optionsByValue = new Map<string, string>();

    options.forEach(({ value, label }) => {
        if (value) {
            optionsByValue.set(value, label);
        }
    });

    return [...optionsByValue.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((first, second) => first.label.localeCompare(second.label));
};

const valuesToOptions = (values: string[]): FilterOption[] =>
    uniqueValues(values).map((value) => ({ value, label: value }));

/** Gets the unique filter options from provided events list */
export const getFilterOptions = (events: EventSlot[]): FilterOptions => ({
    room: valuesToOptions(events.map((event) => event.room.name)),
    date: valuesToOptions(events.map(getEventDate)),
    tag: uniqueOptions(
        events.flatMap((event) => event.tags.map((tag) => ({ value: tag.tag, label: tag.tag })))
    ),
    speaker: uniqueOptions(
        events.flatMap((event) =>
            event.speakers.map((speaker) => ({ value: speaker.code, label: speaker.name }))
        )
    ),
    search: valuesToOptions(events.map((event) => getEventSearchText(event))),
});

/** Gets the date of the event in YYYY-MM-DD format */
export const getEventDate = (event: EventSlot) => event.start?.slice(0, 10) ?? "";

/** Gets the searchable text of the event (from selected fields) */
export const getEventSearchText = (event: EventSlot) =>
    [
        event.id, // cheap lookup and maybe useful for some users
        event.code, // cheap lookup and maybe useful for some users
        event.title,
        event.raw_abstract,
        event.raw_description,
        event.room.name,
        ...event.speakers.map((speaker) => speaker.name),
        ...event.tags.map((tag) => tag.tag),
    ]
        .map((value) => String(value ?? ""))
        .join(" ")
        .toLocaleLowerCase();

/** Checks if event matches selected filters */
export const eventMatchesFilters = (event: EventSlot, filters: ScheduleFilters) => {
    const searchQuery = normalizeText(filters.search);

    return (
        (!filters.room || event.room.name === filters.room) &&
        (!filters.date || getEventDate(event) === filters.date) &&
        (!filters.tag || event.tags.some((tag) => tag.tag === filters.tag)) &&
        (!filters.speaker || event.speakers.some((speaker) => speaker.code === filters.speaker)) &&
        (!searchQuery || getEventSearchText(event).includes(searchQuery))
    );
};
