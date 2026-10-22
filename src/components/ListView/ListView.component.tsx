import { Fragment, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import type { EventSlot } from "../../api";
import { fullDayPageSize } from "../../configuration";
import { usePaginatedSchedule } from "../../hooks/usePaginatedSchedule";
import { ListDisplayMode } from "../../schedule.types";
import type { CompactEventRowData, PageSize } from "../../schedule.types";
import { formatEventDate } from "../../utils/dateTime.utils";
import { formatDayKey, getCompactEventRows } from "../../utils/scheduleEvents.utils";
import { getEventDayKey, UNSCHEDULED_FILTER } from "../../utils/scheduleFilters.utils";
import { CompactEventComponent } from "../CompactEvent";
import { EventCardComponent } from "../EventCard";
import { PaginationComponent } from "../Pagination";
import {
    CompactEventItems,
    CompactEventRow,
    CompactEventRows,
    CompactEventTime,
    DayLabel,
    DayMarker,
    DayRule,
    EventList,
    ListStatus,
    ListViewPanel,
} from "./ListView.styled";

interface ListViewProps {
    events: EventSlot[];
    filteredEvents: EventSlot[];
    scheduleContentRef: React.RefObject<HTMLDivElement | null>;
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
    displayMode: ListDisplayMode;
}

type PaginationItem = EventSlot | CompactEventRowData;

const getPaginationGroupKey = (item: PaginationItem): string =>
    "id" in item ? getEventDayKey(item) : item.dayKey;

export const ListViewComponent = ({
    events,
    filteredEvents,
    scheduleContentRef,
    updateSearchParams,
    displayMode,
}: ListViewProps) => {
    const [searchParams] = useSearchParams();
    const fullDayFromDate = searchParams.has("date");

    const compactRows = useMemo(() => getCompactEventRows(filteredEvents), [filteredEvents]);
    const eventsPerDay = useMemo(() => {
        const counts = new Map<string, number>();

        events.forEach((event) => {
            const dayKey = getEventDayKey(event);
            counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1);
        });

        return counts;
    }, [events]);
    const paginationItems: PaginationItem[] =
        displayMode === ListDisplayMode.Compact ? compactRows : filteredEvents;
    const paginationGroupKeys = useMemo(
        () => [...new Set(paginationItems.map(getPaginationGroupKey))],
        [paginationItems]
    );

    const updateFullDayPageParams = (
        params: URLSearchParams,
        page: number,
        pageSizeForParams: PageSize
    ) => {
        if (pageSizeForParams !== fullDayPageSize) {
            return;
        }

        const dayKey = paginationGroupKeys[page - 1];

        if (dayKey) {
            params.set("date", dayKey);
        }
    };

    const {
        pageSize,
        pageSizeOptions,
        totalItems,
        totalPages,
        currentPage,
        itemsOnPage,
        pageStart,
        pageEnd,
        goToPage,
        setSelectedPageSize,
    } = usePaginatedSchedule<PaginationItem>({
        items: paginationItems,
        getGroupKey: getPaginationGroupKey,
        updatePageParams: updateFullDayPageParams,
        pageSizeOverride: fullDayFromDate ? fullDayPageSize : undefined,
        selectedGroupKey: fullDayFromDate ? (searchParams.get("date") ?? undefined) : undefined,
        searchParams,
        updateSearchParams,
        scheduleContentRef,
    });

    const eventsOnPage = useMemo(
        () =>
            displayMode === ListDisplayMode.Full
                ? itemsOnPage.filter((item): item is EventSlot => "id" in item)
                : [],
        [displayMode, itemsOnPage]
    );
    const compactRowsOnPage = useMemo(
        () =>
            displayMode === ListDisplayMode.Compact
                ? itemsOnPage.filter((item): item is CompactEventRowData => "timeLabel" in item)
                : [],
        [displayMode, itemsOnPage]
    );
    const paginationItemLabel: string | undefined =
        displayMode === ListDisplayMode.Compact && pageSize !== fullDayPageSize
            ? "rows"
            : undefined;
    const fullDayPageKey = pageSize === fullDayPageSize ? paginationGroupKeys[currentPage - 1] : "";
    const fullDayPageLabel = fullDayPageKey ? formatDayKey(fullDayPageKey) : "";
    const fullDayStatusMinWidth =
        pageSize === fullDayPageSize
            ? Math.max(...paginationGroupKeys.map((dayKey) => formatDayKey(dayKey).length), 0) + 2
            : undefined;
    const filteredEventsOnPage =
        displayMode === ListDisplayMode.Compact
            ? compactRowsOnPage.reduce((count, row) => count + row.events.length, 0)
            : eventsOnPage.length;
    const totalEventsOnPage = fullDayPageKey ? (eventsPerDay.get(fullDayPageKey) ?? 0) : 0;
    const paginationRangeText = fullDayPageLabel
        ? `Showing ${filteredEventsOnPage} / ${totalEventsOnPage} items`
        : undefined;
    const paginationStatusText = fullDayPageLabel || undefined;

    const displayEvents = useMemo(
        () =>
            eventsOnPage.map((event, index) => {
                const dayLabel = event.start
                    ? formatEventDate(event.start)
                    : UNSCHEDULED_FILTER.label;
                const previousEvent = eventsOnPage[index - 1];
                const previousDayLabel = previousEvent?.start
                    ? formatEventDate(previousEvent.start)
                    : UNSCHEDULED_FILTER.label;

                return {
                    event,
                    dayLabel,
                    showDayLabel: index === 0 || dayLabel !== previousDayLabel,
                };
            }),
        [eventsOnPage]
    );

    return (
        <>
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                pageStart={pageStart}
                pageEnd={pageEnd}
                totalItems={totalItems}
                itemLabel={paginationItemLabel}
                rangeText={paginationRangeText}
                statusText={paginationStatusText}
                statusMinWidth={fullDayStatusMinWidth}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                position="top"
                onPageChange={goToPage}
                onPageSizeChange={setSelectedPageSize}
            />
            <ListViewPanel>
                {events.length === 0 && <ListStatus>No events found.</ListStatus>}
                {events.length > 0 && totalItems === 0 && (
                    <ListStatus>No events match current filters.</ListStatus>
                )}
                {displayMode === ListDisplayMode.Compact ? (
                    <CompactEventRows role="group" aria-label="Compact event list">
                        {compactRowsOnPage.map((row, index) => {
                            const previousRow = compactRowsOnPage[index - 1];
                            const showDayLabel =
                                index === 0 || previousRow?.dayLabel !== row.dayLabel;

                            return (
                                <Fragment key={`${row.dayLabel}-${row.timeLabel}`}>
                                    {showDayLabel && (
                                        <DayMarker>
                                            <DayLabel>{row.dayLabel}</DayLabel>
                                            <DayRule aria-hidden="true" />
                                        </DayMarker>
                                    )}
                                    <CompactEventRow>
                                        <CompactEventTime>{row.timeLabel}</CompactEventTime>
                                        <CompactEventItems>
                                            {row.events.map((event) => (
                                                <CompactEventComponent
                                                    event={event}
                                                    key={event.id}
                                                />
                                            ))}
                                        </CompactEventItems>
                                    </CompactEventRow>
                                </Fragment>
                            );
                        })}
                    </CompactEventRows>
                ) : (
                    <EventList>
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
                )}
            </ListViewPanel>
            {totalItems > 0 && (
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageStart={pageStart}
                    pageEnd={pageEnd}
                    totalItems={totalItems}
                    itemLabel={paginationItemLabel}
                    rangeText={paginationRangeText}
                    statusText={paginationStatusText}
                    statusMinWidth={fullDayStatusMinWidth}
                    pageSize={pageSize}
                    pageSizeOptions={pageSizeOptions}
                    position="bottom"
                    onPageChange={goToPage}
                    onPageSizeChange={setSelectedPageSize}
                />
            )}
        </>
    );
};
