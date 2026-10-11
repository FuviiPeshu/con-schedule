import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import { CalendarViewComponent } from "../../components/CalendarView";
import { ListViewComponent } from "../../components/ListView";
import { ScheduleFiltersPanel } from "../../components/ScheduleFiltersPanel";
import { inputDebounceMs, storagePrefix } from "../../configuration";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useSchedule } from "../../hooks/useSchedule";
import { useScheduleScroll } from "../../hooks/useScheduleScroll";
import {
    CalendarOrientation,
    ListDisplayMode,
    ScheduleFilters,
    ScheduleView,
} from "../../schedule.types";
import { getCalendarDays } from "../../utils/scheduleEvents.utils";
import {
    emptyFilters,
    eventMatchesFilters,
    getFilterOptions,
} from "../../utils/scheduleFilters.utils";
import { readStoredValue, writeStoredValue } from "../../utils/storage.utils";
import {
    ErrorBanner,
    PageHeader,
    PageSummary,
    PageTitle,
    PageTitleAccent,
    ScheduleBody,
    ScheduleContent,
    SchedulePageShell,
    StatusText,
    ViewControls,
    ViewOptionCheckbox,
    ViewOptionCheckboxInput,
    ViewToggleButton,
    ViewToggleContainer,
} from "./SchedulePage.styled";

const storageKeys = {
    view: `${storagePrefix}:view`,
    filtersOpen: `${storagePrefix}:filters-open`,
    listScrollY: `${storagePrefix}:scroll-y:list`,
    calendarScrollY: `${storagePrefix}:scroll-y:calendar`,
    listDisplayMode: `${storagePrefix}:list-display-mode`,
    calendarOrientation: `${storagePrefix}:calendar-orientation`,
} as const;

const readStoredOption = <T extends string>(key: string, fallback: T, options: readonly T[]): T => {
    const storedValue = readStoredValue<unknown>(key, fallback);

    return typeof storedValue === "string" && options.includes(storedValue as T)
        ? (storedValue as T)
        : fallback;
};

export const SchedulePage = () => {
    const [verticalScrollbarWidth, setVerticalScrollbarWidth] = useState(0);
    const [filtersOpen, setFiltersOpen] = useState(() =>
        readStoredValue(storageKeys.filtersOpen, true)
    );
    const [scheduleView, setScheduleView] = useState<ScheduleView>(() => {
        const storedView = readStoredValue<ScheduleView>(storageKeys.view, ScheduleView.List);
        return Object.values(ScheduleView).includes(storedView) ? storedView : ScheduleView.List;
    });
    const [listDisplayMode, setListDisplayMode] = useState<ListDisplayMode>(() =>
        readStoredOption(
            storageKeys.listDisplayMode,
            ListDisplayMode.Full,
            Object.values(ListDisplayMode)
        )
    );
    const [calendarOrientation, setCalendarOrientation] = useState<CalendarOrientation>(() =>
        readStoredOption(
            storageKeys.calendarOrientation,
            CalendarOrientation.Rooms,
            Object.values(CalendarOrientation)
        )
    );

    const location = useLocation();
    const { data, isLoading, isError } = useSchedule();
    const [searchParams, setSearchParams] = useSearchParams();
    const scheduleContentRef = useRef<HTMLDivElement>(null);

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
    const debouncedSearch = useDebouncedValue(filters.search, inputDebounceMs);
    const searchForFiltering = filters.search ? debouncedSearch : "";
    const resetSchedule = location.state?.resetSchedule === true;
    const activeScheduleView: ScheduleView = resetSchedule
        ? ScheduleView.List
        : searchParams.has("date") && !searchParams.has("page")
          ? ScheduleView.Calendar
          : searchParams.has("page")
            ? ScheduleView.List
            : scheduleView;
    const events = data?.events ?? [];
    const hasActiveFilters = Object.values(filters).some(Boolean);
    const filterOptions = useMemo(() => getFilterOptions(events), [events]);
    const appliedFilters = useMemo(
        () => ({
            ...filters,
            date:
                activeScheduleView === ScheduleView.List &&
                searchParams.has("date") &&
                searchParams.has("page")
                    ? ""
                    : filters.date,
            search: searchForFiltering,
        }),
        [
            activeScheduleView,
            filters.date,
            filters.room,
            filters.speaker,
            filters.tag,
            searchForFiltering,
            searchParams,
        ]
    );
    const filteredEvents = useMemo(
        () => events.filter((event) => eventMatchesFilters(event, appliedFilters)),
        [events, appliedFilters]
    );
    const filteredCalendarDays = useMemo(() => getCalendarDays(filteredEvents), [filteredEvents]);

    const scrollStorageKey =
        activeScheduleView === ScheduleView.Calendar
            ? storageKeys.calendarScrollY
            : storageKeys.listScrollY;

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
        writeStoredValue(storageKeys.filtersOpen, filtersOpen);
    }, [filtersOpen]);

    useEffect(() => {
        writeStoredValue(storageKeys.view, activeScheduleView);
    }, [activeScheduleView]);

    useEffect(() => {
        writeStoredValue(storageKeys.listDisplayMode, listDisplayMode);
    }, [listDisplayMode]);

    useEffect(() => {
        writeStoredValue(storageKeys.calendarOrientation, calendarOrientation);
    }, [calendarOrientation]);

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

    const updateSearchParams = (update: (params: URLSearchParams) => void) => {
        setSearchParams(
            (currentParams) => {
                const nextParams = new URLSearchParams(currentParams);
                update(nextParams);
                return nextParams;
            },
            { replace: true }
        );
    };

    const setFilterValue = (filter: keyof ScheduleFilters, value: string) => {
        updateSearchParams((nextParams) => {
            if (value) {
                nextParams.set(filter, value);
            } else {
                nextParams.delete(filter);
            }

            if (activeScheduleView === ScheduleView.List) {
                nextParams.set("page", "1");
            } else {
                nextParams.delete("page");
            }
        });
    };

    const clearFilters = () => {
        updateSearchParams((nextParams) => {
            (Object.keys(emptyFilters) as Array<keyof ScheduleFilters>).forEach((filter) =>
                nextParams.delete(filter)
            );

            if (activeScheduleView === ScheduleView.List) {
                nextParams.set("page", "1");
            } else {
                nextParams.delete("page");
            }
        });
    };

    const setScheduleViewAndScroll = (view: ScheduleView) => {
        setScheduleView(view);

        updateSearchParams((nextParams) => {
            if (view === ScheduleView.List) {
                nextParams.set("page", "1");
                nextParams.delete("date");
            } else {
                nextParams.delete("page");
                const firstFilteredDay = filteredCalendarDays[0]?.value;
                if (firstFilteredDay) {
                    nextParams.set("date", firstFilteredDay);
                }
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
                    <PageHeader $calendarMode={activeScheduleView === ScheduleView.Calendar}>
                        <div>
                            <PageTitle>
                                Event <PageTitleAccent>schedule</PageTitleAccent>
                            </PageTitle>
                            <PageSummary>All times shown in convention local time.</PageSummary>
                        </div>
                        <ViewControls>
                            <ViewToggleContainer role="group" aria-label="Schedule view">
                                <ViewToggleButton
                                    type="button"
                                    $active={activeScheduleView === ScheduleView.List}
                                    aria-pressed={activeScheduleView === ScheduleView.List}
                                    onClick={() => setScheduleViewAndScroll(ScheduleView.List)}
                                >
                                    List
                                </ViewToggleButton>
                                <ViewToggleButton
                                    type="button"
                                    $active={activeScheduleView === ScheduleView.Calendar}
                                    aria-pressed={activeScheduleView === ScheduleView.Calendar}
                                    onClick={() => setScheduleViewAndScroll(ScheduleView.Calendar)}
                                >
                                    Calendar
                                </ViewToggleButton>
                            </ViewToggleContainer>
                            {activeScheduleView === ScheduleView.List && (
                                <ViewOptionCheckbox>
                                    <ViewOptionCheckboxInput
                                        type="checkbox"
                                        checked={listDisplayMode === ListDisplayMode.Compact}
                                        onChange={(event) =>
                                            setListDisplayMode(
                                                event.target.checked
                                                    ? ListDisplayMode.Compact
                                                    : ListDisplayMode.Full
                                            )
                                        }
                                    />
                                    Compact view
                                </ViewOptionCheckbox>
                            )}
                        </ViewControls>
                    </PageHeader>
                    {activeScheduleView === ScheduleView.Calendar ? (
                        <CalendarViewComponent
                            events={events}
                            filteredEvents={filteredEvents}
                            scheduleContentRef={scheduleContentRef}
                            filters={filters}
                            appliedFilters={appliedFilters}
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
