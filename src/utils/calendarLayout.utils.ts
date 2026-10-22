import { CalendarOrientation } from "../schedule.types";
import type { CalendarRoom, PositionedEvent } from "../schedule.types";

export const gridCellHeight = 100;
export const gridHalfCellHeight = gridCellHeight / 2;
export const roomColumnMinWidth = 256;
export const timeColumnWidth = 80;
export const gridEventMargin = 2;
export const minimumTimelineMinutes = 16 * 60;
export const calendarHalfHourWidth = 72;
export const calendarRoomRowHeight = 112;
export const calendarRoomLabelWidth = 176;

export type CalendarEventLayout = {
    top: number;
    height: number;
    left: number;
    width: number;
};

export type CalendarGridRow = CalendarRoom & {
    placeholder?: boolean;
};

export type CalendarGridLayout = {
    timelineHeight: number;
    roomColumnWidths: number[];
    roomColumnOffsets: number[];
    resolvedRoomColumns: string;
    calendarWidth: number;
    timelineWidth: number;
    alternateCalendarWidth: number;
    horizontalCalendarWidth: number;
    calendarRows: CalendarGridRow[];
    calendarRowHeights: number[];
    calendarRowOffsets: number[];
    calendarBodyWidth: number;
    calendarBodyHeight: number;
    calendarLaneOffsetWidth: number;
    calendarLaneWidth: number;
};

export type CalendarTimelineLayout = {
    timelineStartMinute: number;
    timelineEndMinute: number;
    timelineHalfHours: number;
};

/** Adds placeholder columns when needed to fill the calendar viewport */
export const getCalendarGridRooms = (
    rooms: CalendarRoom[],
    availableWidth: number
): CalendarRoom[] => {
    const availableRoomWidth = Math.max(0, availableWidth - timeColumnWidth);
    const minimumGridRoomCount = Math.max(
        rooms.length,
        Math.max(1, Math.ceil(availableRoomWidth / roomColumnMinWidth))
    );
    const hasRoomRemainder = availableWidth > timeColumnWidth + rooms.length * roomColumnMinWidth;
    const placeholderCount =
        minimumGridRoomCount -
        rooms.length +
        (minimumGridRoomCount === rooms.length && hasRoomRemainder ? 1 : 0);

    return [
        ...rooms,
        ...Array.from({ length: placeholderCount }, (_, index) => ({
            value: `__empty-room-${index}`,
            label: "",
            placeholder: true,
        })),
    ];
};

/** Adds a half-hour leading buffer and keeps the timeline at least 16 hours long */
export const getCalendarTimelineLayout = (events: PositionedEvent[]): CalendarTimelineLayout => {
    const minEventStart = events.length ? Math.min(...events.map((event) => event.startMinute)) : 0;
    const maxEventEnd = events.length ? Math.max(...events.map((event) => event.endMinute)) : 1440;
    const timelineStartMinute = Math.floor(minEventStart / 60) * 60 - 30;
    const timelineEndMinute = Math.max(
        Math.ceil(maxEventEnd / 60) * 60,
        timelineStartMinute + minimumTimelineMinutes
    );

    return {
        timelineStartMinute,
        timelineEndMinute,
        timelineHalfHours: Math.max(1, Math.ceil((timelineEndMinute - timelineStartMinute) / 30)),
    };
};

export type CalendarHourMark = {
    /** Position on the half-hour grid, counted from the timeline start */
    halfHour: number;
    /** Minutes from the convention-day start, used for the label */
    offsetMinutes: number;
};

/** Marks full hours only; half-hour edge buffers intentionally have no mark */
export const getCalendarHourMarks = (
    timelineStartMinute: number,
    timelineHalfHours: number
): CalendarHourMark[] =>
    Array.from({ length: timelineHalfHours + 1 }, (_, halfHour) => ({
        halfHour,
        offsetMinutes: timelineStartMinute + halfHour * 30,
    })).filter(({ offsetMinutes }) => offsetMinutes % 60 === 0);

interface CalendarGridLayoutParams {
    orientation: CalendarOrientation;
    gridRooms: CalendarRoom[];
    rooms: CalendarRoom[];
    availableWidth: number;
    availableHeight: number;
    roomWidthOverrides: Record<string, number>;
    timelineHalfHours: number;
}

/** Computes layout for the calendar grid, including room column widths and offsets */
export const getCalendarGridLayout = ({
    orientation,
    gridRooms,
    rooms,
    availableWidth,
    availableHeight,
    roomWidthOverrides,
    timelineHalfHours,
}: CalendarGridLayoutParams): CalendarGridLayout => {
    const timelineHeight = Math.max(timelineHalfHours * gridHalfCellHeight, availableHeight);
    const baseRoomWidths = gridRooms.map(
        (room) => roomWidthOverrides[room.value] ?? roomColumnMinWidth
    );
    const realRoomsWidth = baseRoomWidths.reduce(
        (total, width, roomIndex) => (gridRooms[roomIndex].placeholder ? total : total + width),
        0
    );
    let placeholderSpace = Math.max(0, availableWidth - timeColumnWidth - realRoomsWidth);
    const roomColumnWidths = gridRooms.map((room, roomIndex) => {
        if (!room.placeholder || availableWidth <= 0) {
            return baseRoomWidths[roomIndex];
        }

        const isLast = roomIndex === gridRooms.length - 1;
        const width = isLast
            ? placeholderSpace
            : Math.min(baseRoomWidths[roomIndex], placeholderSpace);

        placeholderSpace -= width;

        return width;
    });
    const roomColumnOffsets: number[] = [];
    let totalRoomWidth = 0;

    roomColumnWidths.forEach((width) => {
        roomColumnOffsets.push(totalRoomWidth);
        totalRoomWidth += width;
    });

    const calendarWidth = timeColumnWidth + totalRoomWidth;
    const timelineWidth = timelineHalfHours * calendarHalfHourWidth;
    const alternateCalendarWidth = calendarRoomLabelWidth + timelineWidth;
    const minimumRoomRowCount = Math.max(
        rooms.length,
        Math.ceil(availableHeight / calendarRoomRowHeight)
    );
    const calendarRows: CalendarGridRow[] = [
        ...rooms,
        ...Array.from({ length: minimumRoomRowCount - rooms.length }, (_, index) => ({
            value: `__empty-room-row-${index}`,
            label: "",
            placeholder: true,
        })),
    ];
    const calendarBodyHeight =
        orientation === CalendarOrientation.Rooms
            ? timelineHeight
            : Math.max(availableHeight, rooms.length * calendarRoomRowHeight);
    const calendarRowHeights = calendarRows.map((_, rowIndex) =>
        orientation === CalendarOrientation.Times &&
        rowIndex === calendarRows.length - 1 &&
        calendarRows.length > rooms.length
            ? Math.max(0, calendarBodyHeight - rowIndex * calendarRoomRowHeight)
            : calendarRoomRowHeight
    );
    const calendarRowOffsets: number[] = [];
    let totalRowHeight = 0;

    calendarRowHeights.forEach((height) => {
        calendarRowOffsets.push(totalRowHeight);
        totalRowHeight += height;
    });

    return {
        timelineHeight,
        roomColumnWidths,
        roomColumnOffsets,
        resolvedRoomColumns: `${timeColumnWidth}px ${roomColumnWidths.map((width) => `${width}px`).join(" ")}`,
        calendarWidth,
        timelineWidth,
        alternateCalendarWidth,
        horizontalCalendarWidth:
            orientation === CalendarOrientation.Rooms ? calendarWidth : alternateCalendarWidth,
        calendarRows,
        calendarRowHeights,
        calendarRowOffsets,
        calendarBodyWidth:
            orientation === CalendarOrientation.Rooms ? calendarWidth : alternateCalendarWidth,
        calendarBodyHeight,
        calendarLaneOffsetWidth:
            orientation === CalendarOrientation.Rooms ? timeColumnWidth : calendarRoomLabelWidth,
        calendarLaneWidth:
            orientation === CalendarOrientation.Rooms
                ? calendarWidth - timeColumnWidth
                : timelineWidth,
    };
};

/** Computes layout for an individual calendar event within the grid */
export const getCalendarEventLayout = (
    event: PositionedEvent,
    orientation: CalendarOrientation,
    timelineStartMinute: number,
    layout: CalendarGridLayout
): CalendarEventLayout =>
    orientation === CalendarOrientation.Rooms
        ? {
              top:
                  ((event.startMinute - timelineStartMinute) / 60) * gridCellHeight +
                  gridEventMargin,
              height:
                  ((event.endMinute - event.startMinute) / 60) * gridCellHeight - gridEventMargin,
              left: layout.roomColumnOffsets[event.roomIndex] + gridEventMargin,
              width: layout.roomColumnWidths[event.roomIndex] - gridEventMargin,
          }
        : {
              top: layout.calendarRowOffsets[event.roomIndex] + gridEventMargin,
              height: layout.calendarRowHeights[event.roomIndex] - gridEventMargin * 2,
              left:
                  ((event.startMinute - timelineStartMinute) / 30) * calendarHalfHourWidth +
                  gridEventMargin,
              width:
                  ((event.endMinute - event.startMinute) / 30) * calendarHalfHourWidth -
                  gridEventMargin * 2,
          };
