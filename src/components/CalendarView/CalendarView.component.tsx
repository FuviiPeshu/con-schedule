import { useMemo } from "react";
import type { FC } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import type { EventSlot } from "../../api";
import { useCalendarGridInteractions } from "../../hooks/useCalendarGridInteractions";
import { useCalendarRoomPreferences } from "../../hooks/useCalendarRoomPreferences";
import { useCalendarSchedule } from "../../hooks/useCalendarSchedule";
import { CalendarOrientation } from "../../schedule.types";
import {
    calendarHalfHourWidth,
    calendarRoomLabelWidth,
    getCalendarEventLayout,
    getCalendarGridLayout,
    getCalendarGridRooms,
    getCalendarHourMarks,
    getCalendarTimelineLayout,
    gridHalfCellHeight,
    timeColumnWidth,
} from "../../utils/calendarLayout.utils";
import type { CalendarEventLayout } from "../../utils/calendarLayout.utils";
import { formatEventDuration, formatEventTime } from "../../utils/dateTime.utils";
import { getEventLinkProps } from "../../utils/navigation.utils";
import {
    getCalendarRooms,
    getCalendarTimeLabel,
    getPositionedEvents,
} from "../../utils/scheduleEvents.utils";
import { CalendarDayTabsComponent } from "./CalendarDayTabs.component";
import { CalendarHiddenRoomsComponent } from "./CalendarHiddenRooms.component";
import {
    CalendarCanvas,
    CalendarEmpty,
    CalendarEvent,
    CalendarEventMeta,
    CalendarEventTime,
    CalendarEventTitle,
    CalendarGridHours,
    CalendarGridLane,
    CalendarGridRoomLabel,
    CalendarGridRoomLabelColumn,
    CalendarHorizontalScroll,
    CalendarHorizontalScrollContent,
    CalendarHourLabel,
    CalendarHourLine,
    CalendarOrientationArrow,
    CalendarOrientationButton,
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

interface CalendarEventLinkProps {
    event: EventSlot;
    layout: CalendarEventLayout;
    search: string;
}

const CalendarEventLink = ({ event, layout, search }: CalendarEventLinkProps) => (
    <CalendarEvent
        {...getEventLinkProps(event.id, search)}
        aria-label={`${event.start ? formatEventTime(event.start) : "TBD"} ${event.title} ${event.room.name} / ${formatEventDuration(event.duration)}`}
        $trackColor={event.track.color}
        $top={layout.top}
        $height={layout.height}
        $left={layout.left}
        $width={layout.width}
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
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
    orientation: CalendarOrientation;
    onOrientationChange: (orientation: CalendarOrientation) => void;
}

export const CalendarViewComponent: FC<CalendarViewProps> = ({
    events,
    filteredEvents,
    scheduleContentRef,
    updateSearchParams,
    orientation,
    onOrientationChange,
}) => {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const { calendarDays, disabledCalendarDays, activeDay, setSelectedDay } = useCalendarSchedule({
        events,
        filteredEvents,
        selectedDay: searchParams.get("date") ?? "",
        updateSearchParams,
    });
    const {
        hiddenRoomSet,
        roomWidthOverrides,
        toggleRoom,
        startRoomResize,
        moveRoomResize,
        finishRoomResize,
        resizeRoomWithKeyboard,
    } = useCalendarRoomPreferences();

    const allRooms = useMemo(
        () => getCalendarRooms(filteredEvents, activeDay),
        [activeDay, filteredEvents]
    );
    const rooms = useMemo(
        () => allRooms.filter((room) => !hiddenRoomSet.has(room.value)),
        [allRooms, hiddenRoomSet]
    );
    const hiddenRoomDetails = useMemo(
        () => allRooms.filter((room) => hiddenRoomSet.has(room.value)),
        [allRooms, hiddenRoomSet]
    );
    const positionedEvents = useMemo(
        () => getPositionedEvents(filteredEvents, activeDay, rooms),
        [activeDay, filteredEvents, rooms]
    );

    const {
        availableWidth,
        availableHeight,
        isPanning,
        hasHorizontalOverflow,
        hasVerticalOverflow,
        viewportRef,
        horizontalScrollRef,
        calendarCanvasRef,
        roomHeaderRef,
        startGridPan,
        moveGridPan,
        finishGridPan,
        suppressDraggedLinkClick,
        syncHorizontalScroll,
    } = useCalendarGridInteractions({
        scheduleContentRef,
        activeDay,
        orientation,
        eventCount: positionedEvents.length,
    });

    const gridRooms = useMemo(
        () => getCalendarGridRooms(rooms, availableWidth),
        [availableWidth, rooms]
    );
    const { timelineStartMinute, timelineHalfHours } = useMemo(
        () => getCalendarTimelineLayout(positionedEvents),
        [positionedEvents]
    );
    const gridLayout = useMemo(
        () =>
            getCalendarGridLayout({
                orientation,
                gridRooms,
                rooms,
                availableWidth,
                availableHeight,
                roomWidthOverrides,
                timelineHalfHours,
            }),
        [
            availableHeight,
            availableWidth,
            gridRooms,
            orientation,
            roomWidthOverrides,
            rooms,
            timelineHalfHours,
        ]
    );
    const {
        roomColumnWidths,
        roomColumnOffsets,
        resolvedRoomColumns,
        timelineWidth,
        horizontalCalendarWidth,
        calendarRows,
        calendarRowHeights,
        calendarRowOffsets,
        calendarBodyWidth,
        calendarBodyHeight,
        calendarLaneOffsetWidth,
        calendarLaneWidth,
    } = gridLayout;
    const positionedEventLayouts = useMemo(
        () =>
            positionedEvents.map((positionedEvent) => ({
                positionedEvent,
                layout: getCalendarEventLayout(
                    positionedEvent,
                    orientation,
                    timelineStartMinute,
                    gridLayout
                ),
            })),
        [gridLayout, orientation, positionedEvents, timelineStartMinute]
    );
    const hourMarks = useMemo(
        () => getCalendarHourMarks(timelineStartMinute, timelineHalfHours),
        [timelineHalfHours, timelineStartMinute]
    );

    const toggleOrientation = () => {
        onOrientationChange(
            orientation === CalendarOrientation.Rooms
                ? CalendarOrientation.Times
                : CalendarOrientation.Rooms
        );
    };

    return (
        <CalendarViewWrapper>
            <CalendarDayTabsComponent
                days={calendarDays}
                activeDay={activeDay}
                disabledDays={disabledCalendarDays}
                onSelectDay={setSelectedDay}
            />
            <CalendarHiddenRoomsComponent
                rooms={hiddenRoomDetails}
                orientation={orientation}
                onShowRoom={toggleRoom}
            />
            {positionedEvents.length === 0 ? (
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
                                            hiddenRoomSet.has(room.value)
                                        }
                                        $placeholder={Boolean(room.placeholder)}
                                        key={room.value}
                                        title={room.label}
                                    >
                                        {!room.placeholder && <span>{room.label}</span>}
                                        {!room.placeholder && (
                                            <CalendarRoomHide
                                                type="button"
                                                aria-label={`${hiddenRoomSet.has(room.value) ? "Show" : "Hide"} ${room.label}`}
                                                title={`${hiddenRoomSet.has(room.value) ? "Show" : "Hide"} ${room.label}`}
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
                                <CalendarTimeGridHeaderTimeline style={{ width: timelineWidth }}>
                                    {hourMarks.map((mark) => (
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
                                    {hourMarks.map((mark) => (
                                        <CalendarHourLabel
                                            key={mark.halfHour}
                                            style={{ top: mark.halfHour * gridHalfCellHeight }}
                                        >
                                            {getCalendarTimeLabel(mark.offsetMinutes)}
                                        </CalendarHourLabel>
                                    ))}
                                </CalendarGridHours>
                            ) : (
                                <CalendarGridRoomLabelColumn $height={calendarBodyHeight}>
                                    {calendarRows.map((room, roomIndex) => (
                                        <CalendarGridRoomLabel
                                            $height={calendarRowHeights[roomIndex]}
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
                                        {hourMarks.map((mark) => (
                                            <CalendarHourLine
                                                key={mark.halfHour}
                                                style={{ top: mark.halfHour * gridHalfCellHeight }}
                                            />
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {hourMarks.map((mark) => (
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
                                {positionedEventLayouts.map(({ positionedEvent, layout }) => (
                                    <CalendarEventLink
                                        event={positionedEvent.event}
                                        layout={layout}
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
