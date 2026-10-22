import type { EventSlot } from "./api";
import { pageSizeOptions } from "./configuration";

export type PageSize = (typeof pageSizeOptions)[number];

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

export type FilterKey = keyof ScheduleFilters;
export type SelectFilterKey = Exclude<FilterKey, "search">;

export type FilterOptions = Record<SelectFilterKey, FilterOption[]>;

export type FilterAppliedConfig = {
    filterKey: FilterKey;
    label: string;
};

export type FilterUIConfig = FilterAppliedConfig & { emptyLabel: string };

export type SelectFilterUIConfig = FilterUIConfig & { filterKey: SelectFilterKey };

export type CalendarDay = {
    value: string;
    label: string;
    eventsCount: number;
};

export type CalendarRoom = {
    value: string;
    label: string;
    placeholder?: boolean;
};

export type PositionedEvent = {
    event: EventSlot;
    startMinute: number;
    endMinute: number;
    roomIndex: number;
};

export type CompactEventRowData = {
    dayKey: string;
    dayLabel: string;
    timeLabel: string;
    events: EventSlot[];
};

export const ScheduleView = {
    List: "list",
    Calendar: "calendar",
} as const;
export type ScheduleView = (typeof ScheduleView)[keyof typeof ScheduleView];

export const ListDisplayMode = {
    Full: "full",
    Compact: "compact",
} as const;
export type ListDisplayMode = (typeof ListDisplayMode)[keyof typeof ListDisplayMode];

export const CalendarOrientation = {
    Rooms: "rooms",
    Times: "times",
} as const;
export type CalendarOrientation = (typeof CalendarOrientation)[keyof typeof CalendarOrientation];

export const FeedState = {
    Countdown: "Countdown",
    Live: "Live",
    Archive: "Archive",
} as const;
export type FeedState = (typeof FeedState)[keyof typeof FeedState];

export const EventState = {
    Upcoming: "Upcoming",
    Live: "Live",
    Finished: "Finished",
    Unknown: "Unknown",
} as const;
export type EventState = (typeof EventState)[keyof typeof EventState];
