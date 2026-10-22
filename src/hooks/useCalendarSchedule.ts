import { useEffect, useMemo } from "react";

import type { EventSlot } from "../api";
import { getCalendarDays } from "../utils/scheduleEvents.utils";

interface UseCalendarScheduleParams {
    events: EventSlot[];
    /** Events matching the active result filters (room, tag, speaker, search) */
    filteredEvents: EventSlot[];
    /** Day from the `date` query parameter, empty when absent */
    selectedDay: string;
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
}

export const useCalendarSchedule = ({
    events,
    filteredEvents,
    selectedDay,
    updateSearchParams,
}: UseCalendarScheduleParams) => {
    const calendarDays = useMemo(() => getCalendarDays(events), [events]);
    const matchingCalendarDays = useMemo(() => getCalendarDays(filteredEvents), [filteredEvents]);
    const disabledCalendarDays = useMemo(() => {
        const matchingDays = new Set(matchingCalendarDays.map((day) => day.value));

        return new Set(
            calendarDays.filter((day) => !matchingDays.has(day.value)).map((day) => day.value)
        );
    }, [calendarDays, matchingCalendarDays]);

    // A shared day stays selected even when filters leave it empty; only unknown days fall back
    const activeDay = calendarDays.some((day) => day.value === selectedDay)
        ? selectedDay
        : (matchingCalendarDays[0]?.value ?? calendarDays[0]?.value ?? "");

    useEffect(() => {
        if (!activeDay || activeDay === selectedDay) {
            return;
        }

        updateSearchParams((nextParams) => {
            nextParams.delete("page");
            nextParams.set("date", activeDay);
        });
    }, [activeDay, selectedDay, updateSearchParams]);

    const setSelectedDay = (day: string) => {
        updateSearchParams((nextParams) => {
            nextParams.set("date", day);
            nextParams.delete("page");
        });
    };

    return { calendarDays, disabledCalendarDays, activeDay, setSelectedDay };
};
