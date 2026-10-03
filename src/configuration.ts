import conConfig from "../config/schedule-config.json";
import type { FilterAppliedConfig, FilterUIConfig, PageSize } from "./schedule.types";

// JS fields for "config/schedule-config.json" values
export const conName = conConfig.name;
export const conId = conConfig.identifier;
export const conTheme = conConfig.theme;
export const conStart = conConfig.start ?? null;
export const conEnd = conConfig.end ?? null;
export const conNewDayEventStartTime = conConfig.newDayEventStartTime ?? "06:00";
export const conTimeZone = conConfig.timeZone;
export const useMocks = conConfig.useMocks;

// For dev environment go through the vite proxy declared in `vite.config.ts` so the browser doesn't hit cross-origin request
export const apiBase = import.meta.env.DEV ? "/schedule-api" : conConfig.apiUrl;

// App behaviour configuration
export const syncIntervalMs = 5 * 60 * 1000; // how often the schedule is re-fetched from the API
export const inputDebounceMs = 128;
export const pageSizeOptions = [5, 10, 20, 50, 100] as const;
export const defaultPageSize: PageSize = 10;
export const filterInputConfig: FilterUIConfig = {
    label: "Search",
    filterKey: "search",
    emptyLabel: "Search events",
} as const;
export const filterSelectConfigs: FilterUIConfig[] = [
    { label: "Room", filterKey: "room", emptyLabel: "All rooms" },
    { label: "Date", filterKey: "date", emptyLabel: "All dates" },
    { label: "Tag", filterKey: "tag", emptyLabel: "All tags" },
    { label: "Speaker", filterKey: "speaker", emptyLabel: "All speakers" },
] as const;
export const appliedFilterConfigs: FilterAppliedConfig[] = [
    { label: "QUERY", filterKey: "search" },
    { label: "ROOM", filterKey: "room" },
    { label: "DATE", filterKey: "date" },
    { label: "TAG", filterKey: "tag" },
    { label: "SPEAKER", filterKey: "speaker" },
] as const;
