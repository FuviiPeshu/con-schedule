import { Fragment, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import type { EventSlot } from "../../api";
import { usePaginatedSchedule } from "../../hooks/usePaginatedSchedule";
import { formatEventDate } from "../../utils/dateTime.utils";
import { EventCardComponent } from "../EventCard";
import { PaginationComponent } from "../Pagination";
import {
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
}

export const ListViewComponent = ({
    totalEvents,
    filteredEvents,
    scheduleContentRef,
    updateSearchParams,
}: ListViewProps) => {
    const totalItems: number = filteredEvents.length;
    const [searchParams] = useSearchParams();

    const {
        pageSize,
        pageSizeOptions,
        totalPages,
        currentPage,
        eventsOnPage,
        pageStart,
        pageEnd,
        goToPage,
        setSelectedPageSize,
    } = usePaginatedSchedule({
        events: filteredEvents,
        searchParams,
        updateSearchParams,
        scheduleContentRef,
    });

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
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                position="top"
                onPageChange={goToPage}
                onPageSizeChange={setSelectedPageSize}
            />
            <ListViewPanel>
                <EventList>
                    {totalEvents === 0 && <ListStatus>No events found.</ListStatus>}
                    {totalEvents > 0 && totalItems === 0 && (
                        <ListStatus>No events match current filters.</ListStatus>
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
            </ListViewPanel>
            {totalItems > 0 && (
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageStart={pageStart}
                    pageEnd={pageEnd}
                    totalItems={totalItems}
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
