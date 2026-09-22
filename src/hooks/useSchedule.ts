import { useQuery } from "@tanstack/react-query";

import { SCHEDULE_MOCK_DATA } from "../__mocks__/schedule.mocks";
import { buildScheduleData, fetchSchedule } from "../api";
import { syncIntervalMs, useMocks } from "../configuration";
import { ScheduleData } from "../schedule.types";

const getMockSchedule = async () => {
    const { API_RESPONSE_EF30_MOCK } = await import("../__mocks__/api.mocks");
    return API_RESPONSE_EF30_MOCK;
};

export const useSchedule = () =>
    useQuery<ScheduleData>({
        queryKey: ["schedule"],
        queryFn: async ({ signal }) => {
            try {
                const schedule = useMocks ? await getMockSchedule() : await fetchSchedule(signal);
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
