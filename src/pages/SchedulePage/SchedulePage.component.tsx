import { Fragment, useEffect, useMemo, useRef, useState, type UIEvent } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import { AppliedFiltersComponent } from "../../components/AppliedFilters";
import { CalendarViewComponent } from "../../components/CalendarView";
import { EventCardComponent } from "../../components/EventCard";
import { FilterInputComponent, FilterSelectComponent } from "../../components/Filters";
import { PaginationComponent } from "../../components/Pagination";
import {
    conId,
    conName,
    defaultPageSize,
    filterInputConfig,
    filterSelectConfigs,
    inputDebounceMs,
    pageSizeOptions,
} from "../../configuration";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useSchedule } from "../../hooks/useSchedule";
import { PageSize, ScheduleFilters, ScheduleView } from "../../schedule.types";
import { formatEventDate } from "../../utils/dateTime.utils";
import { getCalendarDays } from "../../utils/scheduleEvents.utils";
import {
    emptyFilters,
    eventMatchesFilters,
    getFilterOptions,
} from "../../utils/scheduleFilters.utils";
import { readStoredValue, writeStoredValue } from "../../utils/storage.utils";
import {
    CollapseButton,
    CollapseIcon,
    DayLabel,
    DayMarker,
    DayRule,
    ErrorBanner,
    EventList,
    FilterAside,
    FilterBody,
    FilterControls,
    FilterHeader,
    FilterPanelTitle,
    PageBreadcrumbsWrapper,
    PageHeader,
    PageHeaderNavigationBar,
    PageSummary,
    PageTitle,
    PageTitleAccent,
    ResetButton,
    ScheduleBody,
    ScheduleContent,
    SchedulePageShell,
    SchedulePanel,
    StatusText,
    ViewToggleButton,
    ViewToggleContainer,
} from "./SchedulePage.styled";

const storagePrefix = `con-schedule:${conId}`;
const storageKeys = {
    view: `${storagePrefix}:view`,
    pageSize: `${storagePrefix}:page-size`,
    filtersOpen: `${storagePrefix}:filters-open`,
    listScrollY: `${storagePrefix}:scroll-y:list`,
    calendarScrollY: `${storagePrefix}:scroll-y:calendar`,
} as const;

const parsePage = (value: string | number | null): number => {
    const page: number = Number(value);
    return Number.isInteger(page) && page > 0 ? page : 1;
};

export const SchedulePage = () => {
    const [verticalScrollbarWidth, setVerticalScrollbarWidth] = useState(0);
    const [filtersOpen, setFiltersOpen] = useState(() =>
        readStoredValue(storageKeys.filtersOpen, true)
    );
    const [pageSize, setPageSize] = useState<PageSize>(() => {
        const storedPageSize = readStoredValue<number>(storageKeys.pageSize, defaultPageSize);
        return pageSizeOptions.includes(storedPageSize as PageSize)
            ? (storedPageSize as PageSize)
            : defaultPageSize;
    });
    const [scheduleView, setScheduleView] = useState<ScheduleView>(() => {
        const storedView = readStoredValue<ScheduleView>(storageKeys.view, ScheduleView.List);
        return Object.values(ScheduleView).includes(storedView) ? storedView : ScheduleView.List;
    });

    const location = useLocation();
    const { data, isLoading, isError } = useSchedule();
    const [searchParams, setSearchParams] = useSearchParams();
    const scheduleContentRef = useRef<HTMLDivElement>(null);
    const scrollFrameRef = useRef<number | null>(null);
    const pendingScrollTopRef = useRef(0);

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
    const currentPage = parsePage(searchParams.get("page"));
    const selectedCalendarDay = searchParams.get("day") ?? "";
    const resetSchedule = location.state?.resetSchedule === true;
    const activeScheduleView: ScheduleView = resetSchedule
        ? ScheduleView.List
        : searchParams.has("day")
          ? ScheduleView.Calendar
          : searchParams.has("page")
            ? ScheduleView.List
            : scheduleView;
    const events = data?.events ?? [];
    const hasActiveFilters = Object.values(filters).some(Boolean);
    const filterOptions = useMemo(() => getFilterOptions(events), [events]);
    const appliedFilters = useMemo(
        () => ({ ...filters, search: searchForFiltering }),
        [filters.room, filters.date, filters.tag, filters.speaker, searchForFiltering]
    );
    const filteredEvents = useMemo(
        () => events.filter((event) => eventMatchesFilters(event, appliedFilters)),
        [events, appliedFilters]
    );
    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
    const visiblePage = Math.min(currentPage, totalPages);
    const pageStartIndex = (visiblePage - 1) * pageSize;
    const pageEvents = filteredEvents.slice(pageStartIndex, pageStartIndex + pageSize);
    const pageStart = filteredEvents.length === 0 ? 0 : pageStartIndex + 1;
    const pageEnd = Math.min(pageStartIndex + pageSize, filteredEvents.length);
    const displayEvents = useMemo(
        () =>
            pageEvents.map((event, index) => {
                const dayLabel = event.start ? formatEventDate(event.start) : "Unscheduled";
                const previousEvent = pageEvents[index - 1];
                const previousDayLabel = previousEvent?.start
                    ? formatEventDate(previousEvent.start)
                    : "Unscheduled";

                return {
                    event,
                    dayLabel,
                    showDayLabel: index === 0 || dayLabel !== previousDayLabel,
                };
            }),
        [pageEvents]
    );
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
        filters.room || filters.tag || filters.speaker || searchForFiltering
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
    const activeCalendarDay = filters.date
        ? dateFilterCalendarDay
        : calendarDays.some(
                (day) => day.value === selectedCalendarDay && !disabledCalendarDays.has(day.value)
            )
          ? selectedCalendarDay
          : (matchingCalendarDays[0]?.value ?? calendarDays[0]?.value ?? "");
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
    }, [activeScheduleView, appliedFilters, events.length, filteredEvents.length, pageSize]);

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

    useEffect(() => {
        writeStoredValue(storageKeys.filtersOpen, filtersOpen);
    }, [filtersOpen]);

    useEffect(() => {
        writeStoredValue(storageKeys.pageSize, pageSize);
    }, [pageSize]);

    useEffect(() => {
        writeStoredValue(storageKeys.view, activeScheduleView);
    }, [activeScheduleView]);

    useEffect(() => {
        if (!data) {
            return;
        }

        if (
            activeScheduleView === ScheduleView.Calendar &&
            (activeCalendarDay !== selectedCalendarDay || searchParams.has("page"))
        ) {
            updateSearchParams((nextParams) => {
                nextParams.delete("page");

                if (activeCalendarDay) {
                    nextParams.set("day", activeCalendarDay);
                } else {
                    nextParams.delete("day");
                }
            });
        }
    }, [activeCalendarDay, activeScheduleView, data, searchParams, selectedCalendarDay]);

    useEffect(() => {
        if (scheduleContentRef.current) {
            const restoredScrollTop = resetSchedule ? 0 : readStoredValue(scrollStorageKey, 0);

            scheduleContentRef.current.scrollTop = restoredScrollTop;

            if (resetSchedule) {
                writeStoredValue(storageKeys.listScrollY, 0);
            }
        }
    }, [events.length, resetSchedule, scrollStorageKey]);

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

    const handleScheduleScroll = (event: UIEvent<HTMLDivElement>) => {
        pendingScrollTopRef.current = event.currentTarget.scrollTop;

        if (scrollFrameRef.current !== null || typeof window === "undefined") {
            return;
        }

        scrollFrameRef.current = window.requestAnimationFrame(() => {
            writeStoredValue(scrollStorageKey, pendingScrollTopRef.current);
            scrollFrameRef.current = null;
        });
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

    const goToPage = (page: number) => {
        updateSearchParams((nextParams) => {
            nextParams.set("page", String(page));
            nextParams.delete("day");
        });

        if (scheduleContentRef.current) {
            scheduleContentRef.current.scrollTop = 0;
        }
    };

    const setSelectedPageSize = (value: string) => {
        const nextPageSize = Number(value);

        if (pageSizeOptions.includes(nextPageSize as PageSize)) {
            setPageSize(nextPageSize as PageSize);
            goToPage(1);
        }
    };

    const setScheduleViewAndScroll = (view: ScheduleView) => {
        setScheduleView(view);

        updateSearchParams((nextParams) => {
            if (view === ScheduleView.List) {
                nextParams.set("page", "1");
                nextParams.delete("day");
            } else {
                nextParams.delete("page");

                if (activeCalendarDay) {
                    nextParams.set("day", activeCalendarDay);
                } else {
                    nextParams.delete("day");
                }
            }
        });

        if (scheduleContentRef.current) {
            scheduleContentRef.current.scrollTop = 0;
        }
    };

    const setSelectedCalendarDay = (day: string) => {
        updateSearchParams((nextParams) => {
            nextParams.set("day", day);
            nextParams.set("date", day);
            nextParams.delete("page");
        });
    };

    return isLoading ? (
        <StatusText>Loading schedule...</StatusText>
    ) : !data ? (
        <StatusText>No schedule data available.</StatusText>
    ) : (
        <SchedulePageShell $filtersOpen={filtersOpen}>
            <FilterAside $collapsed={!filtersOpen} aria-label="Schedule filters">
                <FilterHeader $collapsed={!filtersOpen}>
                    {filtersOpen && <FilterPanelTitle>Control panel</FilterPanelTitle>}
                    <CollapseButton
                        type="button"
                        aria-label={filtersOpen ? "Collapse filters" : "Expand filters"}
                        aria-expanded={filtersOpen}
                        aria-controls="schedule-filters"
                        title={filtersOpen ? "Collapse filters" : "Expand filters"}
                        onClick={() => setFiltersOpen((isOpen) => !isOpen)}
                    >
                        <CollapseIcon aria-hidden="true">{filtersOpen ? "<" : ">"}</CollapseIcon>
                    </CollapseButton>
                </FilterHeader>
                {filtersOpen ? (
                    <FilterBody id="schedule-filters">
                        <FilterControls role="group" aria-label="Schedule filters">
                            <FilterInputComponent
                                inputType="search"
                                label={filterInputConfig.label}
                                placeholder={filterInputConfig.emptyLabel}
                                value={filters.search}
                                onChange={(value) =>
                                    setFilterValue(filterInputConfig.filterKey, value)
                                }
                            />
                            {filterSelectConfigs.map(({ label, filterKey, emptyLabel }) => (
                                <FilterSelectComponent
                                    key={filterKey}
                                    label={label}
                                    value={filters[filterKey]}
                                    options={filterOptions[filterKey]}
                                    emptyLabel={emptyLabel}
                                    onChange={(value) => setFilterValue(filterKey, value)}
                                />
                            ))}
                        </FilterControls>
                        <AppliedFiltersComponent
                            filters={filters}
                            onRemove={(filter) => setFilterValue(filter, "")}
                        />
                        <ResetButton
                            type="button"
                            disabled={!hasActiveFilters}
                            onClick={clearFilters}
                        >
                            Clear filters
                        </ResetButton>
                    </FilterBody>
                ) : (
                    <AppliedFiltersComponent
                        filters={filters}
                        compact
                        onRemove={(filter) => setFilterValue(filter, "")}
                        onClear={clearFilters}
                    />
                )}
            </FilterAside>
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
                        <PageHeaderNavigationBar>
                            <PageBreadcrumbsWrapper>
                                {conName} / {conId}
                            </PageBreadcrumbsWrapper>
                            <ViewToggleContainer aria-label="Schedule view">
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
                        </PageHeaderNavigationBar>
                        <div>
                            <PageTitle>
                                Event <PageTitleAccent>schedule</PageTitleAccent>
                            </PageTitle>
                            <PageSummary>All times shown in convention local time.</PageSummary>
                        </div>
                    </PageHeader>
                    {activeScheduleView === ScheduleView.Calendar ? (
                        <CalendarViewComponent
                            days={calendarDays}
                            events={filteredEvents}
                            selectedDay={activeCalendarDay}
                            disabledDays={disabledCalendarDays}
                            onDayChange={setSelectedCalendarDay}
                        />
                    ) : (
                        <>
                            <PaginationComponent
                                currentPage={visiblePage}
                                totalPages={totalPages}
                                pageStart={pageStart}
                                pageEnd={pageEnd}
                                totalItems={filteredEvents.length}
                                pageSize={pageSize}
                                pageSizeOptions={pageSizeOptions}
                                position="top"
                                onPageChange={goToPage}
                                onPageSizeChange={setSelectedPageSize}
                            />
                            <SchedulePanel>
                                <EventList>
                                    {events.length === 0 && (
                                        <StatusText>No events found.</StatusText>
                                    )}
                                    {events.length > 0 && filteredEvents.length === 0 && (
                                        <StatusText>
                                            No events match current filters.
                                        </StatusText>
                                    )}
                                    {displayEvents.map(({ event, dayLabel, showDayLabel }) => (
                                        <Fragment key={event.id}>
                                            {showDayLabel && (
                                                <DayMarker>
                                                    <DayLabel>{dayLabel}</DayLabel>
                                                    <DayRule aria-hidden="true" />
                                                </DayMarker>
                                            )}
                                            <EventCardComponent event={event} />
                                        </Fragment>
                                    ))}
                                </EventList>
                            </SchedulePanel>
                            {filteredEvents.length > 0 && (
                                <PaginationComponent
                                    currentPage={visiblePage}
                                    totalPages={totalPages}
                                    pageStart={pageStart}
                                    pageEnd={pageEnd}
                                    totalItems={filteredEvents.length}
                                    pageSize={pageSize}
                                    pageSizeOptions={pageSizeOptions}
                                    position="bottom"
                                    onPageChange={goToPage}
                                    onPageSizeChange={setSelectedPageSize}
                                />
                            )}
                        </>
                    )}
                </ScheduleBody>
            </ScheduleContent>
        </SchedulePageShell>
    );
};
