import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import type { EventSlot } from "../../api";
import { conId } from "../../configuration";
import { useCalendarSchedule } from "../../hooks/useCalendarSchedule";
import { CalendarOrientation } from "../../schedule.types";
import type { PositionedEvent, ScheduleFilters } from "../../schedule.types";
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
    CalendarGridHours,
    CalendarGridLane,
    CalendarGridRoomLabel,
    CalendarGridRoomLabelColumn,
    CalendarHiddenRoom,
    CalendarHorizontalScroll,
    CalendarHorizontalScrollContent,
    CalendarHourLabel,
    CalendarHourLine,
    CalendarOrientationArrow,
    CalendarOrientationButton,
    CalendarRoomControls,
    CalendarRoomControlsLabel,
    CalendarRoomDivider,
    CalendarRoomHeader,
    CalendarRoomHeaderViewport,
    CalendarRoomHide,
    CalendarRoomLabel,
    CalendarRoomResizeHandle,
    CalendarScrollViewport,
    CalendarTimeGridHeaderLabel,
    CalendarTimeGridHeaderTimeline,
    CalendarTimeGridLine,
    CalendarViewport,
    CalendarViewWrapper,
} from "./CalendarView.styled";

export const gridCellHeight = 100;
export const gridHalfCellHeight = gridCellHeight / 2;
export const roomColumnMinWidth = 256;
export const timeColumnWidth = 80;
export const gridEventMargin = 2;
export const minimumTimelineMinutes = 16 * 60;
export const calendarHalfHourWidth = 72;
export const calendarRoomRowHeight = 112;
export const calendarRoomLabelWidth = 176;
const hiddenRoomsStorageKey = `con-schedule:${conId}:calendar:hidden-rooms`;
const horizontalScrollStorageKey = `con-schedule:${conId}:calendar:scroll-x`;
const roomWidthsStorageKey = `con-schedule:${conId}:calendar:room-widths`;
const roomWidthMin = 160;
const roomWidthMax = 560;
const roomWidthStep = 16;

type CalendarEventLayout = {
    top: number;
    height: number;
    left: number;
    width: number;
};

type CalendarEventLinkProps = {
    event: EventSlot;
    layout: CalendarEventLayout;
    search: string;
};

const CalendarEventLink = ({ event, layout, search }: CalendarEventLinkProps) => (
    <CalendarEvent
        $trackColor={event.track.color}
        $top={layout.top}
        $height={layout.height}
        $left={layout.left}
        $width={layout.width}
        to={{ pathname: `/event/${event.id}`, search }}
        state={{ fromSchedule: true }}
    >
        <CalendarEventTime>{event.start ? formatEventTime(event.start) : "TBD"}</CalendarEventTime>
        <CalendarEventTitle>{event.title}</CalendarEventTitle>
        <CalendarEventMeta>
            {event.room.name} / {formatEventDuration(event.duration)}
        </CalendarEventMeta>
    </CalendarEvent>
);

interface CalendarViewProps {
    events: EventSlot[];
    filteredEvents: EventSlot[];
    scheduleContentRef: React.RefObject<HTMLDivElement | null>;
    filters: ScheduleFilters;
    appliedFilters: ScheduleFilters;
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
    orientation: CalendarOrientation;
    onOrientationChange: (orientation: CalendarOrientation) => void;
}

export const CalendarViewComponent: FC<CalendarViewProps> = ({
    events,
    filteredEvents,
    scheduleContentRef,
    filters,
    appliedFilters,
    updateSearchParams,
    orientation,
    onOrientationChange,
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
    const [roomWidthOverrides, setRoomWidthOverrides] = useState<Record<string, number>>(() => {
        const storedWidths = readStoredValue<Record<string, unknown>>(roomWidthsStorageKey, {});

        return Object.fromEntries(
            Object.entries(storedWidths).flatMap(([roomName, width]) =>
                typeof width === "number" && Number.isFinite(width)
                    ? [[roomName, Math.min(roomWidthMax, Math.max(roomWidthMin, width))]]
                    : []
            )
        );
    });
    const [availableWidth, setAvailableWidth] = useState(0);
    const [availableHeight, setAvailableHeight] = useState(0);
    const [isPanning, setIsPanning] = useState(false);
    const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);
    const [hasVerticalOverflow, setHasVerticalOverflow] = useState(false);

    const location = useLocation();
    const viewportRef = useRef<HTMLDivElement>(null);
    const horizontalScrollRef = useRef<HTMLDivElement>(null);
    const calendarCanvasRef = useRef<HTMLDivElement>(null);
    const roomHeaderRef = useRef<HTMLDivElement>(null);
    const panRef = useRef<{
        pointerId: number;
        startX: number;
        startY: number;
        startScrollLeft: number;
        startScrollTop: number;
        moved: boolean;
        canScrollHorizontally: boolean;
        canScrollVertically: boolean;
    } | null>(null);
    const suppressClickRef = useRef(false);
    const resizeRef = useRef<{
        roomName: string;
        pointerId: number;
        startX: number;
        startWidth: number;
    } | null>(null);
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
    const calculatedTimelineHeight = timelineHalfHours * gridHalfCellHeight;
    const timelineHeight = Math.max(calculatedTimelineHeight, availableHeight);
    const baseRoomWidths = gridRooms.map(
        (room) => roomWidthOverrides[room.value] ?? roomColumnMinWidth
    );
    const roomColumnWidths = gridRooms.map((room, roomIndex) => {
        const isLastPlaceholder = Boolean(room.placeholder) && roomIndex === gridRooms.length - 1;
        const remainingWidth =
            availableWidth -
            timeColumnWidth -
            baseRoomWidths.slice(0, -1).reduce((total, width) => total + width, 0);

        return isLastPlaceholder && availableWidth > 0
            ? Math.max(0, remainingWidth)
            : baseRoomWidths[roomIndex];
    });
    const resolvedRoomColumns = `${timeColumnWidth}px ${roomColumnWidths.map((width) => `${width}px`).join(" ")}`;
    const roomColumnOffsets = roomColumnWidths.map((_, roomIndex) =>
        roomColumnWidths.slice(0, roomIndex).reduce((total, width) => total + width, 0)
    );
    const calendarWidth =
        timeColumnWidth + roomColumnWidths.reduce((total, width) => total + width, 0);
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

    const toggleOrientation = () => {
        onOrientationChange(
            orientation === CalendarOrientation.Rooms
                ? CalendarOrientation.Times
                : CalendarOrientation.Rooms
        );
    };

    const updateRoomWidth = (roomName: string, width: number) => {
        setRoomWidthOverrides((currentWidths) => ({
            ...currentWidths,
            [roomName]: Math.min(roomWidthMax, Math.max(roomWidthMin, width)),
        }));
    };

    const startRoomResize = (
        event: React.PointerEvent<HTMLButtonElement>,
        roomName: string,
        width: number
    ) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        resizeRef.current = {
            roomName,
            pointerId: event.pointerId,
            startX: event.clientX,
            startWidth: width,
        };
    };

    const moveRoomResize = (event: React.PointerEvent<HTMLButtonElement>) => {
        const resize = resizeRef.current;

        if (!resize || resize.pointerId !== event.pointerId) {
            return;
        }

        updateRoomWidth(resize.roomName, resize.startWidth + event.clientX - resize.startX);
    };

    const finishRoomResize = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (resizeRef.current?.pointerId === event.pointerId) {
            resizeRef.current = null;
            event.currentTarget.releasePointerCapture?.(event.pointerId);
        }
    };

    const resizeRoomWithKeyboard = (
        event: React.KeyboardEvent<HTMLButtonElement>,
        roomName: string,
        width: number
    ) => {
        const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;

        if (direction === 0 && event.key !== "Home" && event.key !== "End") {
            return;
        }

        event.preventDefault();
        updateRoomWidth(
            roomName,
            event.key === "Home"
                ? roomWidthMin
                : event.key === "End"
                  ? roomWidthMax
                  : width + direction * roomWidthStep
        );
    };

    const startGridPan = (event: React.PointerEvent<HTMLDivElement>) => {
        suppressClickRef.current = false;

        if (event.button !== 0 || (event.target as HTMLElement).closest("button")) {
            return;
        }

        const viewport = viewportRef.current;
        const scheduleContent = scheduleContentRef.current;
        const canScrollHorizontally = Boolean(
            viewport && viewport.scrollWidth > viewport.clientWidth + 1
        );
        const canScrollVertically = Boolean(
            scheduleContent && scheduleContent.scrollHeight > scheduleContent.clientHeight + 1
        );

        if (!canScrollHorizontally && !canScrollVertically) {
            return;
        }

        event.currentTarget.setPointerCapture?.(event.pointerId);
        panRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startScrollLeft: viewportRef.current?.scrollLeft ?? 0,
            startScrollTop: scheduleContentRef.current?.scrollTop ?? 0,
            moved: false,
            canScrollHorizontally,
            canScrollVertically,
        };
    };

    const moveGridPan = (event: React.PointerEvent<HTMLDivElement>) => {
        const pan = panRef.current;

        if (!pan || pan.pointerId !== event.pointerId) {
            return;
        }

        const deltaX = event.clientX - pan.startX;
        const deltaY = event.clientY - pan.startY;

        if (!pan.moved && Math.hypot(deltaX, deltaY) < 4) {
            return;
        }

        pan.moved = true;
        event.preventDefault();
        if (pan.canScrollHorizontally) {
            syncHorizontalScroll(pan.startScrollLeft - deltaX);
        }

        if (pan.canScrollVertically && scheduleContentRef.current) {
            const maxScrollTop = Math.max(
                0,
                scheduleContentRef.current.scrollHeight - scheduleContentRef.current.clientHeight
            );
            scheduleContentRef.current.scrollTop = Math.min(
                maxScrollTop,
                Math.max(0, pan.startScrollTop - deltaY)
            );
        }
        setIsPanning(true);
    };

    const finishGridPan = (event: React.PointerEvent<HTMLDivElement>) => {
        const pan = panRef.current;

        if (!pan || pan.pointerId !== event.pointerId) {
            return;
        }

        suppressClickRef.current = pan.moved;
        panRef.current = null;
        setIsPanning(false);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
    };

    const suppressDraggedLinkClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
        }
    };

    const syncHorizontalScroll = (scrollLeft: number) => {
        const viewport = viewportRef.current;
        const maxScrollLeft = viewport
            ? Math.max(0, viewport.scrollWidth - viewport.clientWidth)
            : Math.max(
                  0,
                  (horizontalScrollRef.current?.scrollWidth ?? 0) -
                      (horizontalScrollRef.current?.clientWidth ?? 0)
              );
        const boundedScrollLeft = Math.min(Math.max(0, scrollLeft), maxScrollLeft);

        writeStoredValue(horizontalScrollStorageKey, boundedScrollLeft);

        if (viewport && viewport.scrollLeft !== boundedScrollLeft) {
            viewport.scrollLeft = boundedScrollLeft;
        }

        if (
            horizontalScrollRef.current &&
            horizontalScrollRef.current.scrollLeft !== boundedScrollLeft
        ) {
            horizontalScrollRef.current.scrollLeft = boundedScrollLeft;
        }

        if (roomHeaderRef.current) {
            roomHeaderRef.current.style.transform = `translateX(-${boundedScrollLeft}px)`;
        }
    };

    const timelineWidth = timelineHalfHours * calendarHalfHourWidth;
    const alternateCalendarWidth = calendarRoomLabelWidth + timelineWidth;
    const horizontalCalendarWidth =
        orientation === CalendarOrientation.Rooms ? calendarWidth : alternateCalendarWidth;
    const minimumRoomRowCount = Math.max(
        rooms.length,
        Math.ceil(availableHeight / calendarRoomRowHeight)
    );
    const calendarRows = [
        ...rooms,
        ...Array.from({ length: minimumRoomRowCount - rooms.length }, (_, index) => ({
            value: `__empty-room-row-${index}`,
            label: "",
            placeholder: true,
        })),
    ];
    const calendarBodyWidth =
        orientation === CalendarOrientation.Rooms ? calendarWidth : alternateCalendarWidth;
    const calendarBodyHeight =
        orientation === CalendarOrientation.Rooms
            ? timelineHeight
            : Math.max(availableHeight, rooms.length * calendarRoomRowHeight);
    const getCalendarRowHeight = (rowIndex: number) =>
        orientation === CalendarOrientation.Times &&
        rowIndex === calendarRows.length - 1 &&
        calendarRows.length > rooms.length
            ? Math.max(0, calendarBodyHeight - rowIndex * calendarRoomRowHeight)
            : calendarRoomRowHeight;
    const calendarRowOffsets = calendarRows.map((_, rowIndex) =>
        calendarRows
            .slice(0, rowIndex)
            .reduce((total, _row, offsetIndex) => total + getCalendarRowHeight(offsetIndex), 0)
    );
    const calendarLaneOffsetWidth =
        orientation === CalendarOrientation.Rooms ? timeColumnWidth : calendarRoomLabelWidth;
    const calendarLaneWidth =
        orientation === CalendarOrientation.Rooms ? calendarWidth - timeColumnWidth : timelineWidth;

    const getEventLayout = ({
        startMinute,
        endMinute,
        roomIndex,
    }: PositionedEvent): CalendarEventLayout =>
        orientation === CalendarOrientation.Rooms
            ? {
                  top:
                      ((startMinute - timelineStartMinute) / 60) * gridCellHeight + gridEventMargin,
                  height: ((endMinute - startMinute) / 60) * gridCellHeight - gridEventMargin,
                  left: roomColumnOffsets[roomIndex] + gridEventMargin,
                  width: roomColumnWidths[roomIndex] - gridEventMargin,
              }
            : {
                  top: roomIndex * calendarRoomRowHeight + gridEventMargin,
                  height: calendarRoomRowHeight - gridEventMargin * 2,
                  left:
                      ((startMinute - timelineStartMinute) / 30) * calendarHalfHourWidth +
                      gridEventMargin,
                  width:
                      ((endMinute - startMinute) / 30) * calendarHalfHourWidth -
                      gridEventMargin * 2,
              };

    useEffect(() => {
        syncHorizontalScroll(readStoredValue(horizontalScrollStorageKey, 0));
    }, [availableWidth, activeDay, orientation]);

    useEffect(() => {
        writeStoredValue(hiddenRoomsStorageKey, hiddenRooms);
    }, [hiddenRooms]);

    useEffect(() => {
        writeStoredValue(roomWidthsStorageKey, roomWidthOverrides);
    }, [roomWidthOverrides]);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) {
            return;
        }

        const updateDimensions = () => {
            setAvailableWidth(viewport.clientWidth);
            setAvailableHeight(viewport.clientHeight);
        };

        const updateWidth = updateDimensions;
        updateWidth();

        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(updateWidth);
        observer.observe(viewport);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const viewport = viewportRef.current;
        const canvas = calendarCanvasRef.current;
        const scheduleContent = scheduleContentRef.current;

        if (!viewport) {
            return;
        }

        const updateOverflow = () => {
            setHasHorizontalOverflow(viewport.scrollWidth > viewport.clientWidth + 1);
            setHasVerticalOverflow(
                Boolean(
                    scheduleContent &&
                    scheduleContent.scrollHeight > scheduleContent.clientHeight + 1
                )
            );
        };

        updateOverflow();

        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(updateOverflow);
        observer.observe(viewport);
        canvas && observer.observe(canvas);
        scheduleContent && observer.observe(scheduleContent);

        return () => observer.disconnect();
    }, [
        activeDay,
        availableHeight,
        availableWidth,
        filteredEvents.length,
        hiddenRooms.length,
        orientation,
        roomWidthOverrides,
    ]);

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
                <CalendarRoomControls
                    aria-label={
                        orientation === CalendarOrientation.Rooms
                            ? "Hidden room columns"
                            : "Hidden room rows"
                    }
                >
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
                            ref={
                                orientation === CalendarOrientation.Rooms
                                    ? roomHeaderRef
                                    : undefined
                            }
                            style={{
                                gridTemplateColumns:
                                    orientation === CalendarOrientation.Rooms
                                        ? resolvedRoomColumns
                                        : `${calendarRoomLabelWidth}px ${timelineWidth}px`,
                            }}
                        >
                            <CalendarOrientationButton
                                type="button"
                                aria-label="Swap columns and rows"
                                title="Swap columns and rows"
                                onClick={toggleOrientation}
                            >
                                <CalendarOrientationArrow aria-hidden="true">
                                    &lt;-&gt;
                                </CalendarOrientationArrow>
                            </CalendarOrientationButton>
                            {orientation === CalendarOrientation.Rooms ? (
                                gridRooms.map((room, roomIndex) => (
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
                                        {!room.placeholder && (
                                            <CalendarRoomResizeHandle
                                                type="button"
                                                aria-label={`Resize ${room.label} column`}
                                                title={`Resize ${room.label} column`}
                                                onPointerDown={(event) =>
                                                    startRoomResize(
                                                        event,
                                                        room.value,
                                                        roomColumnWidths[roomIndex]
                                                    )
                                                }
                                                onPointerMove={moveRoomResize}
                                                onPointerUp={finishRoomResize}
                                                onPointerCancel={finishRoomResize}
                                                onKeyDown={(event) =>
                                                    resizeRoomWithKeyboard(
                                                        event,
                                                        room.value,
                                                        roomColumnWidths[roomIndex]
                                                    )
                                                }
                                            />
                                        )}
                                    </CalendarRoomLabel>
                                ))
                            ) : (
                                <CalendarTimeGridHeaderTimeline
                                    ref={roomHeaderRef}
                                    style={{ width: timelineWidth }}
                                >
                                    {calendarHalfHourMarks
                                        .filter((mark) => mark.showLabel)
                                        .map((mark) => (
                                            <CalendarTimeGridHeaderLabel
                                                $left={mark.halfHour * calendarHalfHourWidth}
                                                key={mark.halfHour}
                                            >
                                                {getCalendarTimeLabel(mark.offsetMinutes)}
                                            </CalendarTimeGridHeaderLabel>
                                        ))}
                                </CalendarTimeGridHeaderTimeline>
                            )}
                        </CalendarRoomHeader>
                    </CalendarRoomHeaderViewport>
                    <CalendarScrollViewport
                        ref={viewportRef}
                        data-testid="calendar-grid-viewport"
                        $panning={isPanning}
                        $dragEnabled={hasHorizontalOverflow || hasVerticalOverflow}
                        onPointerDown={startGridPan}
                        onPointerMove={moveGridPan}
                        onPointerUp={finishGridPan}
                        onPointerCancel={finishGridPan}
                        onLostPointerCapture={finishGridPan}
                        onClickCapture={suppressDraggedLinkClick}
                        onScroll={() => syncHorizontalScroll(viewportRef.current?.scrollLeft ?? 0)}
                    >
                        <CalendarCanvas
                            ref={calendarCanvasRef}
                            style={{
                                width: calendarBodyWidth,
                                height: calendarBodyHeight,
                            }}
                        >
                            {orientation === CalendarOrientation.Rooms ? (
                                <CalendarGridHours
                                    $width={timeColumnWidth}
                                    $height={calendarBodyHeight}
                                >
                                    {calendarHalfHourMarks
                                        .filter((mark) => mark.showLabel)
                                        .map((mark) => (
                                            <CalendarHourLabel
                                                key={mark.halfHour}
                                                style={{
                                                    top: mark.halfHour * gridHalfCellHeight,
                                                }}
                                            >
                                                {getCalendarTimeLabel(mark.offsetMinutes)}
                                            </CalendarHourLabel>
                                        ))}
                                </CalendarGridHours>
                            ) : (
                                <CalendarGridRoomLabelColumn $height={calendarBodyHeight}>
                                    {calendarRows.map((room, roomIndex) => (
                                        <CalendarGridRoomLabel
                                            $height={getCalendarRowHeight(roomIndex)}
                                            key={room.value}
                                        >
                                            <span>{room.label}</span>
                                            {!room.placeholder && (
                                                <CalendarRoomHide
                                                    type="button"
                                                    aria-label={`Hide ${room.label}`}
                                                    title={`Hide ${room.label}`}
                                                    onClick={() => toggleRoom(room.value)}
                                                >
                                                    x
                                                </CalendarRoomHide>
                                            )}
                                        </CalendarGridRoomLabel>
                                    ))}
                                </CalendarGridRoomLabelColumn>
                            )}
                            <CalendarGridLane
                                $left={calendarLaneOffsetWidth}
                                $width={calendarLaneWidth}
                                $height={calendarBodyHeight}
                            >
                                {orientation === CalendarOrientation.Rooms ? (
                                    <>
                                        {gridRooms.slice(1).map((room, roomIndex) => (
                                            <CalendarRoomDivider
                                                key={room.value}
                                                style={{
                                                    left: `${roomColumnOffsets[roomIndex + 1]}px`,
                                                }}
                                            />
                                        ))}
                                        {calendarHalfHourMarks
                                            .filter((mark) => mark.showLabel)
                                            .map((mark) => (
                                                <CalendarHourLine
                                                    key={mark.halfHour}
                                                    style={{
                                                        top: mark.halfHour * gridHalfCellHeight,
                                                    }}
                                                />
                                            ))}
                                    </>
                                ) : (
                                    <>
                                        {calendarHalfHourMarks
                                            .filter((mark) => mark.showLabel)
                                            .map((mark) => (
                                                <CalendarTimeGridLine
                                                    $left={mark.halfHour * calendarHalfHourWidth}
                                                    key={mark.halfHour}
                                                />
                                            ))}
                                        {calendarRows.map((room, roomIndex) => (
                                            <CalendarHourLine
                                                key={room.value}
                                                style={{ top: calendarRowOffsets[roomIndex] }}
                                            />
                                        ))}
                                    </>
                                )}
                                {positionedEvents.map((positionedEvent) => (
                                    <CalendarEventLink
                                        event={positionedEvent.event}
                                        layout={getEventLayout(positionedEvent)}
                                        key={positionedEvent.event.id}
                                        search={location.search}
                                    />
                                ))}
                            </CalendarGridLane>
                        </CalendarCanvas>
                    </CalendarScrollViewport>
                    {hasHorizontalOverflow && (
                        <CalendarHorizontalScroll
                            ref={horizontalScrollRef}
                            aria-label={`Scroll calendar ${orientation === CalendarOrientation.Rooms ? "rooms" : "times"} horizontally`}
                            onScroll={() =>
                                syncHorizontalScroll(horizontalScrollRef.current?.scrollLeft ?? 0)
                            }
                        >
                            <CalendarHorizontalScrollContent
                                style={{ width: horizontalCalendarWidth }}
                            />
                        </CalendarHorizontalScroll>
                    )}
                </CalendarViewport>
            )}
        </CalendarViewWrapper>
    );
};
