import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import type { EventSlot } from "../../api";
import { CalendarViewComponent } from "../../components/CalendarView";
import { ListViewComponent } from "../../components/ListView";
import { ScheduleFiltersPanel } from "../../components/ScheduleFiltersPanel";
import { inputDebounceMs, storagePrefix } from "../../configuration";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePersistedState } from "../../hooks/usePersistedState";
import { useSchedule } from "../../hooks/useSchedule";
import { useScheduleScroll } from "../../hooks/useScheduleScroll";
import {
    CalendarOrientation,
    ListDisplayMode,
    ScheduleFilters,
    ScheduleView,
} from "../../schedule.types";
import { isScheduleReset } from "../../utils/navigation.utils";
import { getCalendarDays } from "../../utils/scheduleEvents.utils";
import {
    emptyFilters,
    eventMatchesFilters,
    getFilterOptions,
} from "../../utils/scheduleFilters.utils";
import { resolveScheduleView } from "../../utils/scheduleView.utils";
import { booleanOr, oneOf, readStoredValue, writeStoredValue } from "../../utils/storage.utils";
import {
    ErrorBanner,
    ScheduleBody,
    ScheduleContent,
    SchedulePageShell,
    StatusText,
} from "./SchedulePage.styled";

const storageKeys = {
    view: `${storagePrefix}:view`,
    filtersOpen: `${storagePrefix}:filters-open`,
    listScrollY: `${storagePrefix}:scroll-y:list`,
    calendarScrollY: `${storagePrefix}:scroll-y:calendar`,
    listDisplayMode: `${storagePrefix}:list-display-mode`,
    calendarOrientation: `${storagePrefix}:calendar-orientation`,
} as const;

const parseScheduleView = oneOf(Object.values(ScheduleView), ScheduleView.List);
const parseListDisplayMode = oneOf(Object.values(ListDisplayMode), ListDisplayMode.Full);
const parseCalendarOrientation = oneOf(
    Object.values(CalendarOrientation),
    CalendarOrientation.Rooms
);

const noEvents: EventSlot[] = []; // stable reference so memos keyed on the events do not rerun while the schedule is loading

export const SchedulePage = () => {
    const [verticalScrollbarWidth, setVerticalScrollbarWidth] = useState(0);
    const [scheduleView, setScheduleView] = useState<ScheduleView>(() =>
        parseScheduleView(readStoredValue<unknown>(storageKeys.view, undefined))
    );
    const [filtersOpen, setFiltersOpen] = usePersistedState(
        storageKeys.filtersOpen,
        booleanOr(true)
    );
    const [listDisplayMode, setListDisplayMode] = usePersistedState(
        storageKeys.listDisplayMode,
        parseListDisplayMode
    );
    const [calendarOrientation, setCalendarOrientation] = usePersistedState(
        storageKeys.calendarOrientation,
        parseCalendarOrientation
    );

    const location = useLocation();
    const { data, isLoading, isError } = useSchedule();
    const [searchParams, setSearchParams] = useSearchParams();
    const scheduleContentRef = useRef<HTMLDivElement>(null);
    const events = data?.events ?? noEvents;

    const filters = useMemo<ScheduleFilters>(
        () => ({
            room: searchParams.get("room") ?? "",
            date: searchParams.get("date") ?? "",
            tag: searchParams.get("tag") ?? "",
            speaker: searchParams.get("speaker") ?? "",
            search: searchParams.get("search") ?? "",
        }),
        [searchParams]
    );
    const filterOptions = useMemo(() => getFilterOptions(events), [events]);
    const hasActiveFilters = Object.values(filters).some(Boolean);
    const debouncedSearch = useDebouncedValue(filters.search, inputDebounceMs);
    const searchForFiltering = filters.search ? debouncedSearch : "";
    const resetSchedule = isScheduleReset(location.state);
    const activeScheduleView = resolveScheduleView({
        searchParams,
        reset: resetSchedule,
        storedView: scheduleView,
    });
    const scrollStorageKey =
        activeScheduleView === ScheduleView.Calendar
            ? storageKeys.calendarScrollY
            : storageKeys.listScrollY;

    const appliedFilters = useMemo<ScheduleFilters>(
        () => ({
            room: filters.room,
            date: "",
            tag: filters.tag,
            speaker: filters.speaker,
            search: searchForFiltering,
        }),
        [filters.room, filters.tag, filters.speaker, searchForFiltering]
    );
    const filteredEvents = useMemo(
        () => events.filter((event) => eventMatchesFilters(event, appliedFilters)),
        [events, appliedFilters]
    );

    useEffect(() => {
        const scheduleContent = scheduleContentRef.current;

        if (!scheduleContent) {
            return;
        }

        const updateScrollbarWidth = () => {
            setVerticalScrollbarWidth(
                Math.max(0, scheduleContent.offsetWidth - scheduleContent.clientWidth)
            );
        };

        updateScrollbarWidth();

        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(updateScrollbarWidth);
        observer.observe(scheduleContent);

        return () => observer.disconnect();
    }, [activeScheduleView, appliedFilters, events.length, filteredEvents.length]);

    useEffect(() => {
        writeStoredValue(storageKeys.view, activeScheduleView);
    }, [activeScheduleView]);

    useEffect(() => {
        if (typeof window.matchMedia !== "function") {
            return;
        }

        const mobileQuery = window.matchMedia("(max-width: 680px)");
        const handleViewportChange = () => {
            if (mobileQuery.matches) {
                setFiltersOpen(true);
            }
        };

        handleViewportChange();
        mobileQuery.addEventListener("change", handleViewportChange);

        return () => mobileQuery.removeEventListener("change", handleViewportChange);
    }, []);

    const handleScheduleScroll = useScheduleScroll({
        contentRef: scheduleContentRef,
        storageKey: scrollStorageKey,
        reset: resetSchedule,
        restoreKey: events.length,
    });

    const updateSearchParams = useCallback(
        (update: (params: URLSearchParams) => void) => {
            setSearchParams(
                (currentParams) => {
                    const nextParams = new URLSearchParams(currentParams);
                    update(nextParams);
                    return nextParams;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const resetPagePosition = (params: URLSearchParams) => {
        if (activeScheduleView === ScheduleView.List) {
            params.set("page", "1");
        } else {
            params.delete("page");
        }
    };

    const setFilterValue = (filter: keyof ScheduleFilters, value: string) => {
        updateSearchParams((nextParams) => {
            if (value) {
                nextParams.set(filter, value);
            } else {
                nextParams.delete(filter);
            }

            resetPagePosition(nextParams);
        });
    };

    const clearFilters = () => {
        updateSearchParams((nextParams) => {
            (Object.keys(emptyFilters) as Array<keyof ScheduleFilters>).forEach((filter) =>
                nextParams.delete(filter)
            );

            resetPagePosition(nextParams);
        });
    };

    const changeScheduleView = (view: ScheduleView) => {
        const firstMatchingDay =
            view === ScheduleView.Calendar ? getCalendarDays(filteredEvents)[0]?.value : undefined;

        setScheduleView(view);

        updateSearchParams((nextParams) => {
            if (view === ScheduleView.List) {
                nextParams.set("page", "1");
                nextParams.delete("date");
                return;
            }

            nextParams.delete("page");

            if (firstMatchingDay) {
                nextParams.set("date", firstMatchingDay);
            }
        });

        if (scheduleContentRef.current) {
            scheduleContentRef.current.scrollTop = 0;
        }
    };

    return isLoading ? (
        <StatusText>Loading schedule...</StatusText>
    ) : !data ? (
        <StatusText>No schedule data available.</StatusText>
    ) : (
        <SchedulePageShell $filtersOpen={filtersOpen}>
            <ScheduleFiltersPanel
                filters={filters}
                filterOptions={filterOptions}
                filtersOpen={filtersOpen}
                hasActiveFilters={hasActiveFilters}
                view={activeScheduleView}
                onViewChange={changeScheduleView}
                listDisplayMode={listDisplayMode}
                onListDisplayModeChange={setListDisplayMode}
                onToggle={() => setFiltersOpen((isOpen) => !isOpen)}
                onFilterChange={setFilterValue}
                onClear={clearFilters}
            />
            <ScheduleContent
                ref={scheduleContentRef}
                data-testid="schedule-content"
                $calendarMode={activeScheduleView === ScheduleView.Calendar}
                $verticalScrollbarWidth={verticalScrollbarWidth}
                onScroll={handleScheduleScroll}
            >
                <ScheduleBody $calendarMode={activeScheduleView === ScheduleView.Calendar}>
                    {isError && <ErrorBanner>Error occured, showing mock data.</ErrorBanner>}
                    {activeScheduleView === ScheduleView.Calendar ? (
                        <CalendarViewComponent
                            events={events}
                            filteredEvents={filteredEvents}
                            scheduleContentRef={scheduleContentRef}
                            updateSearchParams={updateSearchParams}
                            orientation={calendarOrientation}
                            onOrientationChange={setCalendarOrientation}
                        />
                    ) : (
                        <ListViewComponent
                            events={events}
                            filteredEvents={filteredEvents}
                            scheduleContentRef={scheduleContentRef}
                            updateSearchParams={updateSearchParams}
                            displayMode={listDisplayMode}
                        />
                    )}
                </ScheduleBody>
            </ScheduleContent>
        </SchedulePageShell>
    );
};
