import type { EventSlot } from "./api";

export type ScheduleData = {
    events: EventSlot[];
};

export type ScheduleFilters = {
    room: string;
    date: string;
    tag: string;
    speaker: string;
    search: string;
};

export type FilterOption = {
    value: string;
    label: string;
};

export type SelectFilterKey = Exclude<keyof ScheduleFilters, "search">;

export type FilterOptions = Record<SelectFilterKey, FilterOption[]>;
