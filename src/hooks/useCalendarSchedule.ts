import { useEffect, useMemo } from "react";

import type { EventSlot } from "../api";
import type { ScheduleFilters } from "../schedule.types";
import { getCalendarDays } from "../utils/scheduleEvents.utils";
import { eventMatchesFilters } from "../utils/scheduleFilters.utils";

interface UseCalendarScheduleParams {
    events: EventSlot[];
    filteredEvents: EventSlot[];
    filters: ScheduleFilters;
    appliedFilters: ScheduleFilters;
    selectedDay: string;
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
}

export const useCalendarSchedule = ({
    events,
    filteredEvents,
    filters,
    appliedFilters,
    selectedDay,
    updateSearchParams,
}: UseCalendarScheduleParams) => {
    const calendarDayEvents = useMemo(() => {
        if (!filters.date) {
            return filteredEvents;
        }

        const filtersWithoutDate = { ...appliedFilters, date: "" };

        return events.filter((event) => eventMatchesFilters(event, filtersWithoutDate));
    }, [appliedFilters, events, filters.date, filteredEvents]);
    const calendarDays = useMemo(() => getCalendarDays(events), [events]);
    const matchingCalendarDays = useMemo(
        () => getCalendarDays(calendarDayEvents),
        [calendarDayEvents]
    );
    const dateFilteredCalendarDays = useMemo(
        () => getCalendarDays(filteredEvents),
        [filteredEvents]
    );
    const dateFilterCalendarDay = useMemo(() => {
        if (!filters.date) {
            return "";
        }

        return calendarDays.some((day) => day.value === filters.date)
            ? filters.date
            : (dateFilteredCalendarDays[0]?.value ?? calendarDays[0]?.value ?? "");
    }, [calendarDays, dateFilteredCalendarDays, filters.date]);
    const hasCalendarResultFilters = Boolean(
        filters.room || filters.tag || filters.speaker || appliedFilters.search
    );
    const disabledCalendarDays = useMemo(
        () =>
            hasCalendarResultFilters
                ? new Set(
                      calendarDays
                          .filter(
                              (day) =>
                                  !matchingCalendarDays.some(
                                      (matchingDay) => matchingDay.value === day.value
                                  )
                          )
                          .map((day) => day.value)
                  )
                : new Set<string>(),
        [calendarDays, hasCalendarResultFilters, matchingCalendarDays]
    );

    const activeDay = filters.date
        ? dateFilterCalendarDay
        : calendarDays.some(
                (day) => day.value === selectedDay && !disabledCalendarDays.has(day.value)
            )
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
