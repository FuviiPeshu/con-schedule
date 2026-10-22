import type { EventSlot } from "../api";
import type { FilterOption, FilterOptions, ScheduleFilters } from "../schedule.types";
import { getScheduleDayKey } from "./dateTime.utils";
import { normalizeText } from "./text.utils";

export const emptyFilters: ScheduleFilters = {
    room: "",
    date: "",
    tag: "",
    speaker: "",
    search: "",
};

export const UNSCHEDULED_FILTER: FilterOption = {
    label: "Unscheduled",
    value: "Unscheduled",
} as const;

/** Removes empty values, deduplicates, and sorts locale-aware */
export const uniqueValues = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort((first, second) => first.localeCompare(second));

/** Removes empty values, deduplicates by value, and sorts by label */
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

/** Gets unique filter options from provided events list */
export const getFilterOptions = (events: EventSlot[]): FilterOptions => ({
    room: valuesToOptions(events.map((event) => event.room.name)),
    date: valuesToOptions(events.map(getEventDayKey)),
    tag: uniqueOptions(
        events.flatMap((event) => event.tags.map((tag) => ({ value: tag.tag, label: tag.tag })))
    ),
    speaker: uniqueOptions(
        events.flatMap((event) =>
            event.speakers.map((speaker) => ({ value: speaker.code, label: speaker.name }))
        )
    ),
});

/** Gets schedule day key (yyyy-MM-dd, respecting the day start time) or "" for unscheduled events */
export const getEventDate = (event: EventSlot) =>
    event.start ? getScheduleDayKey(event.start) : "";

/** Gets schedule day key of the event, or the unscheduled bucket value when it has no start */
export const getEventDayKey = (event: EventSlot) => getEventDate(event) || UNSCHEDULED_FILTER.value;

const searchTextCache = new WeakMap<EventSlot, string>();

/** Returns normalized text from the fields supported by schedule search */
export const getEventSearchText = (event: EventSlot) => {
    const cached = searchTextCache.get(event);

    if (cached !== undefined) {
        return cached;
    }

    const searchText = [
        event.id,
        event.code,
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

    searchTextCache.set(event, searchText);

    return searchText;
};

/** Checks if event matches selected filters */
export const eventMatchesFilters = (event: EventSlot, filters: ScheduleFilters) => {
    const searchQuery = normalizeText(filters.search);

    return (
        (!filters.room || event.room.name === filters.room) &&
        (!filters.date || getEventDayKey(event) === filters.date) &&
        (!filters.tag || event.tags.some((tag) => tag.tag === filters.tag)) &&
        (!filters.speaker || event.speakers.some((speaker) => speaker.code === filters.speaker)) &&
        (!searchQuery || getEventSearchText(event).includes(searchQuery))
    );
};
