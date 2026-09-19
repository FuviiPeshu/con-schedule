import conConfig from "../config/schedule-config.json";

export const conName = conConfig.name;
export const conId = conConfig.identifier;
export const conTimeZone = conConfig.timeZone;

/** For dev environment go through the vite proxy declared in `vite.config.ts` so the browser doesn't hit cross-origin request */
export const apiBase = import.meta.env.DEV ? "/schedule-api" : conConfig.apiUrl;

/** How often the schedule is re-fetched from the API. */
export const syncIntervalMs = 5 * 60 * 1000;
