import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import type { EventSlot } from "../../api";
import { conId } from "../../configuration";
import { useCalendarSchedule } from "../../hooks/useCalendarSchedule";
import type { ScheduleFilters } from "../../schedule.types";
import { formatEventDuration, formatEventTime } from "../../utils/dateTime.utils";
import {
    eventOverlapsScheduleDay,
    getCalendarGridRooms,
    getCalendarRooms,
    getCalendarTimeLabel,
    getPositionedEvents,
} from "../../utils/scheduleEvents.utils";
import { readStoredValue, writeStoredValue } from "../../utils/storage.utils";
import {
    CalendarCanvas,
    CalendarDayButton,
    CalendarDayLabel,
    CalendarDaySelector,
    CalendarEmpty,
    CalendarEvent,
    CalendarEventMeta,
    CalendarEventTime,
    CalendarEventTitle,
    CalendarHiddenRoom,
    CalendarHorizontalScroll,
    CalendarHorizontalScrollContent,
    CalendarHourLabel,
    CalendarHourLine,
    CalendarHours,
    CalendarLane,
    CalendarRoomControls,
    CalendarRoomControlsLabel,
    CalendarRoomCorner,
    CalendarRoomDivider,
    CalendarRoomHeader,
    CalendarRoomHeaderViewport,
    CalendarRoomHide,
    CalendarRoomLabel,
    CalendarScrollViewport,
    CalendarTimeline,
    CalendarViewport,
    CalendarViewWrapper,
} from "./CalendarView.styled";

export const gridCellHeight = 100;
export const gridHalfCellHeight = gridCellHeight / 2;
export const roomColumnMinWidth = 256;
export const timeColumnWidth = 80;
export const gridEventMargin = 2;
export const minimumTimelineMinutes = 16 * 60;
const hiddenRoomsStorageKey = `con-schedule:${conId}:calendar:hidden-rooms`;
const horizontalScrollStorageKey = `con-schedule:${conId}:calendar:scroll-x`;

interface CalendarViewProps {
    events: EventSlot[];
    filteredEvents: EventSlot[];
    filters: ScheduleFilters;
    appliedFilters: ScheduleFilters;
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
}

export const CalendarViewComponent: FC<CalendarViewProps> = ({
    events,
    filteredEvents,
    filters,
    appliedFilters,
    updateSearchParams,
}) => {
    const [searchParams] = useSearchParams();
    const { calendarDays, disabledCalendarDays, activeDay, setSelectedDay } = useCalendarSchedule({
        events,
        filteredEvents,
        filters,
        appliedFilters,
        selectedDay: searchParams.get("date") ?? "",
        updateSearchParams,
    });

    const [hiddenRooms, setHiddenRooms] = useState<string[]>(() =>
        readStoredValue<string[]>(hiddenRoomsStorageKey, [])
    );
    const [availableWidth, setAvailableWidth] = useState(0);

    const location = useLocation();
    const viewportRef = useRef<HTMLDivElement>(null);
    const horizontalScrollRef = useRef<HTMLDivElement>(null);
    const roomHeaderRef = useRef<HTMLDivElement>(null);
    const allRooms = useMemo(
        () => getCalendarRooms(filteredEvents, activeDay),
        [activeDay, filteredEvents]
    );

    const rooms = allRooms.filter((room) => !hiddenRooms.includes(room.value));
    const hiddenRoomDetails = allRooms.filter((room) => hiddenRooms.includes(room.value));
    const gridRooms = getCalendarGridRooms(rooms, availableWidth);
    const dayEvents = filteredEvents.filter(
        (event) =>
            eventOverlapsScheduleDay(event, activeDay) &&
            rooms.some((room) => room.value === event.room.name)
    );
    const positionedEvents = getPositionedEvents(filteredEvents, activeDay, rooms);
    const minEventStart = positionedEvents.length
        ? Math.min(...positionedEvents.map((event) => event.startMinute))
        : 0;
    const maxEventEnd = positionedEvents.length
        ? Math.max(...positionedEvents.map((event) => event.endMinute))
        : 1440;
    const timelineStartMinute = Math.floor(minEventStart / 60) * 60 - 30;
    const timelineEndMinute = Math.max(
        Math.ceil(maxEventEnd / 60) * 60,
        timelineStartMinute + minimumTimelineMinutes
    );
    const timelineHalfHours = Math.max(
        1,
        Math.ceil((timelineEndMinute - timelineStartMinute) / 30)
    );
    const timelineHeight = timelineHalfHours * gridHalfCellHeight;
    const roomColumns = `${timeColumnWidth}px ${gridRooms.map(() => `${roomColumnMinWidth}px`).join(" ")}`;
    const calendarWidth = timeColumnWidth + gridRooms.length * roomColumnMinWidth;
    const calendarHalfHourMarks = Array.from({ length: timelineHalfHours + 1 }, (_, halfHour) => {
        const offsetMinutes = timelineStartMinute + halfHour * 30;

        return {
            halfHour,
            offsetMinutes,
            showLabel: offsetMinutes % 60 === 0,
        };
    });

    const toggleRoom = (roomName: string) => {
        setHiddenRooms((currentHiddenRooms) =>
            currentHiddenRooms.includes(roomName)
                ? currentHiddenRooms.filter((currentRoom) => currentRoom !== roomName)
                : [...currentHiddenRooms, roomName]
        );
    };

    const syncHorizontalScroll = (scrollLeft: number) => {
        writeStoredValue(horizontalScrollStorageKey, scrollLeft);

        if (viewportRef.current && viewportRef.current.scrollLeft !== scrollLeft) {
            viewportRef.current.scrollLeft = scrollLeft;
        }

        if (horizontalScrollRef.current && horizontalScrollRef.current.scrollLeft !== scrollLeft) {
            horizontalScrollRef.current.scrollLeft = scrollLeft;
        }

        if (roomHeaderRef.current) {
            roomHeaderRef.current.style.transform = `translateX(-${scrollLeft}px)`;
        }
    };

    useEffect(() => {
        syncHorizontalScroll(readStoredValue(horizontalScrollStorageKey, 0));
    }, [availableWidth, activeDay]);

    useEffect(() => {
        writeStoredValue(hiddenRoomsStorageKey, hiddenRooms);
    }, [hiddenRooms]);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) {
            return;
        }

        const updateWidth = () => setAvailableWidth(viewport.clientWidth);
        updateWidth();

        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(updateWidth);
        observer.observe(viewport);

        return () => observer.disconnect();
    }, []);

    return (
        <CalendarViewWrapper>
            <CalendarDaySelector role="tablist" aria-label="Schedule days">
                {calendarDays.map((day) => {
                    const isDisabled = disabledCalendarDays.has(day.value);

                    return (
                        <CalendarDayButton
                            $active={day.value === activeDay}
                            $disabled={isDisabled}
                            key={day.value}
                            type="button"
                            role="tab"
                            aria-selected={day.value === activeDay}
                            aria-disabled={isDisabled}
                            disabled={isDisabled}
                            onClick={() => setSelectedDay(day.value)}
                        >
                            <CalendarDayLabel>{day.label}</CalendarDayLabel>
                            <span>{day.eventsCount} events</span>
                        </CalendarDayButton>
                    );
                })}
            </CalendarDaySelector>
            {hiddenRoomDetails.length > 0 && (
                <CalendarRoomControls aria-label="Hidden room columns">
                    <CalendarRoomControlsLabel>Hidden rooms</CalendarRoomControlsLabel>
                    {hiddenRoomDetails.map((room) => (
                        <CalendarHiddenRoom key={room.value} title={room.label}>
                            <span>{room.label}</span>
                            <CalendarRoomHide
                                $compact
                                type="button"
                                aria-label={`Show ${room.label}`}
                                title={`Show ${room.label}`}
                                onClick={() => toggleRoom(room.value)}
                            >
                                x
                            </CalendarRoomHide>
                        </CalendarHiddenRoom>
                    ))}
                </CalendarRoomControls>
            )}
            {dayEvents.length === 0 ? (
                <CalendarEmpty>
                    {allRooms.length > 0 && rooms.length === 0
                        ? "All room columns are hidden. Remove at least one room from the hidden list above."
                        : "No events match current filters."}
                </CalendarEmpty>
            ) : (
                <CalendarViewport>
                    <CalendarRoomHeaderViewport>
                        <CalendarRoomHeader
                            ref={roomHeaderRef}
                            style={{
                                gridTemplateColumns: roomColumns,
                            }}
                        >
                            <CalendarRoomCorner></CalendarRoomCorner>
                            {gridRooms.map((room) => (
                                <CalendarRoomLabel
                                    $hidden={
                                        Boolean(room.placeholder) ||
                                        hiddenRooms.includes(room.value)
                                    }
                                    $placeholder={Boolean(room.placeholder)}
                                    key={room.value}
                                    title={room.label}
                                >
                                    {!room.placeholder && <span>{room.label}</span>}
                                    {!room.placeholder && (
                                        <CalendarRoomHide
                                            type="button"
                                            aria-label={`${hiddenRooms.includes(room.value) ? "Show" : "Hide"} ${room.label}`}
                                            title={`${hiddenRooms.includes(room.value) ? "Show" : "Hide"} ${room.label}`}
                                            onClick={() => toggleRoom(room.value)}
                                        >
                                            x
                                        </CalendarRoomHide>
                                    )}
                                </CalendarRoomLabel>
                            ))}
                        </CalendarRoomHeader>
                    </CalendarRoomHeaderViewport>
                    <CalendarScrollViewport
                        ref={viewportRef}
                        onScroll={() => syncHorizontalScroll(viewportRef.current?.scrollLeft ?? 0)}
                    >
                        <CalendarCanvas style={{ width: calendarWidth }}>
                            <CalendarTimeline
                                style={{ height: timelineHeight, gridTemplateColumns: roomColumns }}
                            >
                                <CalendarHours>
                                    {calendarHalfHourMarks
                                        .filter((mark) => mark.showLabel)
                                        .map((mark) => (
                                            <CalendarHourLabel
                                                key={mark.halfHour}
                                                style={{ top: mark.halfHour * gridHalfCellHeight }}
                                            >
                                                {getCalendarTimeLabel(mark.offsetMinutes)}
                                            </CalendarHourLabel>
                                        ))}
                                </CalendarHours>
                                <CalendarLane style={{ height: timelineHeight }}>
                                    {gridRooms.slice(1).map((room, roomIndex) => (
                                        <CalendarRoomDivider
                                            key={room.value}
                                            style={{
                                                left: `${(roomIndex + 1) * roomColumnMinWidth}px`,
                                            }}
                                        />
                                    ))}
                                    {calendarHalfHourMarks
                                        .filter((mark) => mark.showLabel)
                                        .map((mark) => (
                                            <CalendarHourLine
                                                key={mark.halfHour}
                                                style={{ top: mark.halfHour * gridHalfCellHeight }}
                                            />
                                        ))}
                                    {positionedEvents.map(
                                        ({ event, startMinute, endMinute, roomIndex }) => {
                                            const left =
                                                roomIndex * roomColumnMinWidth + gridEventMargin;
                                            const width = roomColumnMinWidth - gridEventMargin;

                                            return (
                                                <CalendarEvent
                                                    $trackColor={event.track.color}
                                                    $top={
                                                        ((startMinute - timelineStartMinute) / 60) *
                                                            gridCellHeight +
                                                        gridEventMargin
                                                    }
                                                    $height={
                                                        ((endMinute - startMinute) / 60) *
                                                            gridCellHeight -
                                                        gridEventMargin
                                                    }
                                                    $left={left}
                                                    $width={width}
                                                    key={event.id}
                                                    to={{
                                                        pathname: `/event/${event.id}`,
                                                        search: location.search,
                                                    }}
                                                    state={{ fromSchedule: true }}
                                                >
                                                    <CalendarEventTime>
                                                        {event.start
                                                            ? formatEventTime(event.start)
                                                            : "TBD"}
                                                    </CalendarEventTime>
                                                    <CalendarEventTitle>
                                                        {event.title}
                                                    </CalendarEventTitle>
                                                    <CalendarEventMeta>
                                                        {event.room.name} /{" "}
                                                        {formatEventDuration(event.duration)}
                                                    </CalendarEventMeta>
                                                </CalendarEvent>
                                            );
                                        }
                                    )}
                                </CalendarLane>
                            </CalendarTimeline>
                        </CalendarCanvas>
                    </CalendarScrollViewport>
                    {availableWidth > 0 && calendarWidth > availableWidth && (
                        <CalendarHorizontalScroll
                            ref={horizontalScrollRef}
                            aria-label="Scroll calendar rooms horizontally"
                            onScroll={() =>
                                syncHorizontalScroll(horizontalScrollRef.current?.scrollLeft ?? 0)
                            }
                        >
                            <CalendarHorizontalScrollContent style={{ width: calendarWidth }} />
                        </CalendarHorizontalScroll>
                    )}
                </CalendarViewport>
            )}
        </CalendarViewWrapper>
    );
};
