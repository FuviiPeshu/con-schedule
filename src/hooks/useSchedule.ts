import { useQuery } from "@tanstack/react-query";

import { SCHEDULE_MOCK_DATA } from "../__mocks__/schedule.mocks";
import { buildScheduleData, fetchSchedule } from "../api";
import { syncIntervalMs } from "../configuration";
import { ScheduleData } from "../schedule.types";

export const useSchedule = () =>
    useQuery<ScheduleData>({
        queryKey: ["schedule"],
        queryFn: async ({ signal }) => {
            try {
                const schedule = await fetchSchedule(signal);
                return buildScheduleData(schedule);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    throw error;
                }
                console.warn("Falling back to mock schedule data:", error);
                return buildScheduleData(SCHEDULE_MOCK_DATA);
            }
        },
        refetchInterval: syncIntervalMs,
        staleTime: syncIntervalMs,
    });
