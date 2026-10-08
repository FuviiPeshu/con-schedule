import { Fragment, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import type { EventSlot } from "../../api";
import { fullDayPageSize } from "../../configuration";
import { usePaginatedSchedule } from "../../hooks/usePaginatedSchedule";
import { ListDisplayMode } from "../../schedule.types";
import type { PageSize } from "../../schedule.types";
import {
    formatEventDate,
    formatEventTime,
    formatScheduleDay,
    getScheduleDayKey,
} from "../../utils/dateTime.utils";
import { UNSCHEDULED_FILTER } from "../../utils/scheduleFilters.utils";
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

type CompactEventRow = {
    dayKey: string;
    dayLabel: string;
    timeLabel: string;
    events: EventSlot[];
};

const getEventDayKey = (event: EventSlot): string =>
    event.start ? getScheduleDayKey(event.start) : UNSCHEDULED_FILTER.value;

const getCompactEventRows = (events: EventSlot[]): CompactEventRow[] => {
    const rows: CompactEventRow[] = [];

    events.forEach((event) => {
        const dayKey = getEventDayKey(event);
        const dayLabel =
            dayKey === UNSCHEDULED_FILTER.value ? "Unscheduled" : formatScheduleDay(dayKey);
        const timeLabel = event.start ? formatEventTime(event.start) : "TBD";
        const previousRow = rows[rows.length - 1];

        if (previousRow && previousRow.dayKey === dayKey && previousRow.timeLabel === timeLabel) {
            previousRow.events.push(event);
            return;
        }

        rows.push({ dayKey, dayLabel, timeLabel, events: [event] });
    });

    return rows;
};

export const ListViewComponent = ({
    events,
    filteredEvents,
    scheduleContentRef,
    updateSearchParams,
    displayMode,
}: ListViewProps) => {
    const [searchParams] = useSearchParams();
    const compactRows = useMemo(() => getCompactEventRows(filteredEvents), [filteredEvents]);
    const paginationItems = displayMode === ListDisplayMode.Compact ? compactRows : filteredEvents;
    const getPaginationGroupKey = (item: EventSlot | CompactEventRow): string =>
        "id" in item ? getEventDayKey(item) : item.dayKey;
    const paginationGroupKeys = useMemo(
        () => [...new Set(paginationItems.map(getPaginationGroupKey))],
        [paginationItems]
    );
    const fullDayFromDate = searchParams.has("date");
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
    } = usePaginatedSchedule<EventSlot | CompactEventRow>({
        items: paginationItems,
        getGroupKey: getPaginationGroupKey,
        updatePageParams: updateFullDayPageParams,
        pageSizeOverride: fullDayFromDate ? fullDayPageSize : undefined,
        selectedGroupKey: fullDayFromDate ? (searchParams.get("date") ?? undefined) : undefined,
        searchParams,
        updateSearchParams,
        scheduleContentRef,
    });

    const eventsOnPage =
        displayMode === ListDisplayMode.Full
            ? itemsOnPage.filter((item): item is EventSlot => "id" in item)
            : [];
    const compactRowsOnPage =
        displayMode === ListDisplayMode.Compact
            ? itemsOnPage.filter((item): item is CompactEventRow => "timeLabel" in item)
            : [];
    const paginationItemLabel: string | undefined =
        displayMode === ListDisplayMode.Compact && pageSize !== fullDayPageSize
            ? "rows"
            : undefined;
    const fullDayPageKey = pageSize === fullDayPageSize ? paginationGroupKeys[currentPage - 1] : "";
    const fullDayPageLabel =
        fullDayPageKey && fullDayPageKey !== UNSCHEDULED_FILTER.value
            ? formatScheduleDay(fullDayPageKey)
            : fullDayPageKey === UNSCHEDULED_FILTER.value
              ? UNSCHEDULED_FILTER.label
              : "";
    const fullDayStatusMinWidth =
        pageSize === fullDayPageSize
            ? Math.max(
                  ...paginationGroupKeys.map((dayKey) =>
                      dayKey === UNSCHEDULED_FILTER.value
                          ? UNSCHEDULED_FILTER.label.length
                          : formatScheduleDay(dayKey).length
                  ),
                  0
              ) + 2
            : undefined;
    const filteredEventsOnPage =
        displayMode === ListDisplayMode.Compact
            ? compactRowsOnPage.reduce((count, row) => count + row.events.length, 0)
            : eventsOnPage.length;
    const totalEventsOnPage = fullDayPageLabel
        ? events.filter((event) => getEventDayKey(event) === fullDayPageKey).length
        : 0;
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
