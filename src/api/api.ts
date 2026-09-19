import { apiBase } from "../configuration";
import type { ScheduleData } from "../schedule.types";
import type { ScheduleResponse } from "./api.types";

export const fetchSchedule = async (signal?: AbortSignal): Promise<ScheduleResponse> => {
    const response = await fetch(apiBase, {
        signal,
        headers: { Accept: "application/json" },
    });

    if (!response.ok) {
        throw new Error(`Schedule fetch failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as ScheduleResponse;
};

/** Flattens all days slots into one array */
export const buildScheduleData = (schedule: ScheduleResponse): ScheduleData => {
    const events = schedule.days
        .flatMap((day) => day.slots)
        .sort((a, b) => {
            if (!a.start) return 1;
            if (!b.start) return -1;
            return Date.parse(a.start) - Date.parse(b.start);
        });

    return { events };
};
