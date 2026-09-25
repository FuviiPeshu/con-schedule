import conConfig from "../config/schedule-config.json";

export const conName = conConfig.name;
export const conId = conConfig.identifier;
export const conStart = conConfig.start ?? null;
export const conEnd = conConfig.end ?? null;
export const conNewDayEventStartTime = conConfig.newDayEventStartTime ?? "06:00";
export const conTimeZone = conConfig.timeZone;

export const useMocks = conConfig.useMocks;

/** For dev environment go through the vite proxy declared in `vite.config.ts` so the browser doesn't hit cross-origin request */
export const apiBase = import.meta.env.DEV ? "/schedule-api" : conConfig.apiUrl;

/** How often the schedule is re-fetched from the API. */
export const syncIntervalMs = 5 * 60 * 1000;
