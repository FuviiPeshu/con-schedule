import type { EventSlot } from "../api";
import { conNewDayEventStartTime } from "../configuration";
import type {
    CalendarDay,
    CalendarRoom,
    CompactEventRowData,
    PositionedEvent,
} from "../schedule.types";
import {
    formatEventTime,
    formatScheduleDay,
    getScheduleDayKey,
    getScheduleMinuteOffset,
    parseClockTime,
} from "./dateTime.utils";
import { getEventDayKey, UNSCHEDULED_FILTER } from "./scheduleFilters.utils";

/** Uses duration when no end is provided; unscheduled events have no end */
const getEventEndIso = (event: EventSlot): string | null => {
    if (event.end) {
        return event.end;
    } else if (!event.start) {
        return null;
    }
    return new Date(Date.parse(event.start) + event.duration * 60_000).toISOString();
};

/** Tests overlap with the selected convention-day window, including overnight events */
export const eventOverlapsScheduleDay = (event: EventSlot, selectedDay: string): boolean => {
    if (!event.start) {
        return false;
    }

    const end = getEventEndIso(event);
    if (!end) {
        return false;
    }

    const startMinuteOffset = getScheduleMinuteOffset(event.start, selectedDay);
    const endMinuteOffset = getScheduleMinuteOffset(end, selectedDay);

    return startMinuteOffset < 1440 && endMinuteOffset > 0;
};

/** Keeps calendar blocks at least 30 minutes tall */
const getEndMinute = (event: EventSlot, startMinute: number, selectedDay: string) => {
    if (!event.end) {
        return startMinute + Math.max(event.duration, 30);
    }
    return Math.max(startMinute + 30, getScheduleMinuteOffset(event.end, selectedDay));
};

/** Extracts unique room names from events and returns them as calendar rooms */
export const getCalendarRooms = (events: EventSlot[], selectedDay: string): CalendarRoom[] => {
    const roomNames = new Set<string>();

    events.forEach((event) => {
        if (eventOverlapsScheduleDay(event, selectedDay)) {
            roomNames.add(event.room.name);
        }
    });

    return [...roomNames]
        .sort((first, second) => first.localeCompare(second))
        .map((roomName) => ({ value: roomName, label: roomName }));
};

/** Positions events within the calendar grid based on their start and end times and room assignment */
export const getPositionedEvents = (
    events: EventSlot[],
    selectedDay: string,
    rooms = getCalendarRooms(events, selectedDay)
): PositionedEvent[] => {
    const roomIndexes = new Map(rooms.map((room, index) => [room.value, index]));

    return events
        .flatMap((event) => {
            if (!eventOverlapsScheduleDay(event, selectedDay)) {
                return [];
            }

            const roomIndex = roomIndexes.get(event.room.name);

            if (roomIndex === undefined) {
                return [];
            }

            const startMinute = getScheduleMinuteOffset(event.start!, selectedDay);
            const endMinute = getEndMinute(event, startMinute, selectedDay);
            return [
                {
                    event,
                    startMinute,
                    endMinute,
                    roomIndex,
                },
            ];
        })
        .sort(
            (first, second) =>
                first.roomIndex - second.roomIndex ||
                first.startMinute - second.startMinute ||
                first.endMinute - second.endMinute
        );
};

/** Includes a +N suffix when an offset falls after the convention-day boundary */
export const getCalendarTimeLabel = (offsetMinutes: number): string => {
    const totalMinutes = parseClockTime(conNewDayEventStartTime) + offsetMinutes;
    const dayOffset = Math.floor(totalMinutes / 1440);
    const minutes = totalMinutes % 1440;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}${dayOffset > 0 ? ` +${dayOffset}` : ""}`;
};

/** Lists convention days overlapped by events, with each day's event count */
export const getCalendarDays = (events: EventSlot[]): CalendarDay[] => {
    const dayKeys = new Set<string>();

    events.forEach((event) => {
        if (!event.start) {
            return;
        }

        dayKeys.add(getScheduleDayKey(event.start));

        const end = getEventEndIso(event);

        if (end) {
            dayKeys.add(getScheduleDayKey(end));
        }
    });

    return [...dayKeys].flatMap((value) => {
        const eventsCount = events.filter((event) => eventOverlapsScheduleDay(event, value)).length;

        return eventsCount > 0 ? [{ value, label: formatScheduleDay(value), eventsCount }] : [];
    });
};

/** Formats a convention-day key or the Unscheduled bucket for display */
export const formatDayKey = (dayKey: string): string =>
    dayKey === UNSCHEDULED_FILTER.value ? UNSCHEDULED_FILTER.label : formatScheduleDay(dayKey);

/** Groups consecutive events by convention day and local start time */
export const getCompactEventRows = (events: EventSlot[]): CompactEventRowData[] => {
    const rows: CompactEventRowData[] = [];

    events.forEach((event) => {
        const dayKey = getEventDayKey(event);
        const timeLabel = event.start ? formatEventTime(event.start) : "TBD";
        const previousRow = rows[rows.length - 1];

        if (previousRow?.dayKey === dayKey && previousRow.timeLabel === timeLabel) {
            previousRow.events.push(event);
            return;
        }

        rows.push({ dayKey, dayLabel: formatDayKey(dayKey), timeLabel, events: [event] });
    });

    return rows;
};
