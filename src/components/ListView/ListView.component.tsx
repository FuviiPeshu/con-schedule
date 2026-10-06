import { Fragment, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import type { EventSlot } from "../../api";
import { usePaginatedSchedule } from "../../hooks/usePaginatedSchedule";
import { ListDisplayMode } from "../../schedule.types";
import { formatEventDate, formatEventTime } from "../../utils/dateTime.utils";
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
    totalEvents: number;
    filteredEvents: EventSlot[];
    scheduleContentRef: React.RefObject<HTMLDivElement | null>;
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
    displayMode: ListDisplayMode;
}

type CompactEventRow = {
    dayLabel: string;
    timeLabel: string;
    events: EventSlot[];
};

const getCompactEventRows = (events: EventSlot[]): CompactEventRow[] => {
    const rows: CompactEventRow[] = [];

    events.forEach((event) => {
        const dayLabel = event.start ? formatEventDate(event.start) : "Unscheduled";
        const timeLabel = event.start ? formatEventTime(event.start) : "TBD";
        const previousRow = rows[rows.length - 1];

        if (
            previousRow &&
            previousRow.dayLabel === dayLabel &&
            previousRow.timeLabel === timeLabel
        ) {
            previousRow.events.push(event);
            return;
        }

        rows.push({ dayLabel, timeLabel, events: [event] });
    });

    return rows;
};

export const ListViewComponent = ({
    totalEvents,
    filteredEvents,
    scheduleContentRef,
    updateSearchParams,
    displayMode,
}: ListViewProps) => {
    const [searchParams] = useSearchParams();
    const compactRows = useMemo(() => getCompactEventRows(filteredEvents), [filteredEvents]);
    const paginationItems = displayMode === ListDisplayMode.Compact ? compactRows : filteredEvents;

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

    const displayEvents = useMemo(
        () =>
            eventsOnPage.map((event, index) => {
                const dayLabel = event.start ? formatEventDate(event.start) : "Unscheduled";
                const previousEvent = eventsOnPage[index - 1];
                const previousDayLabel = previousEvent?.start
                    ? formatEventDate(previousEvent.start)
                    : "Unscheduled";

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
                itemLabel={displayMode === ListDisplayMode.Compact ? "rows" : undefined}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                position="top"
                onPageChange={goToPage}
                onPageSizeChange={setSelectedPageSize}
            />
            <ListViewPanel>
                {totalEvents === 0 && <ListStatus>No events found.</ListStatus>}
                {totalEvents > 0 && totalItems === 0 && (
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
                    itemLabel={displayMode === ListDisplayMode.Compact ? "rows" : undefined}
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
