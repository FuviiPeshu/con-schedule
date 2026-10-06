import type { EventSlot } from "../api";
import {
    roomColumnMinWidth,
    timeColumnWidth,
} from "../components/CalendarView/CalendarView.component";
import { conNewDayEventStartTime } from "../configuration";
import type { CalendarDay, CalendarRoom, PositionedEvent } from "../schedule.types";
import {
    formatScheduleDay,
    getScheduleDayKey,
    getScheduleMinuteOffset,
    parseClockTime,
} from "./dateTime.utils";

const getEventEndIso = (event: EventSlot): string | null => {
    if (event.end) {
        return event.end;
    } else if (!event.start) {
        return null;
    }
    return new Date(Date.parse(event.start) + event.duration * 60_000).toISOString();
};

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

const getEndMinute = (event: EventSlot, startMinute: number, selectedDay: string) => {
    if (!event.end) {
        return startMinute + Math.max(event.duration, 30);
    }
    return Math.max(startMinute + 30, getScheduleMinuteOffset(event.end, selectedDay));
};

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

export const getPositionedEvents = (
    events: EventSlot[],
    selectedDay: string,
    rooms = getCalendarRooms(events, selectedDay)
): PositionedEvent[] =>
    events
        .filter(
            (event) =>
                eventOverlapsScheduleDay(event, selectedDay) &&
                rooms.some((room) => room.value === event.room.name)
        )
        .map((event) => {
            const startMinute = getScheduleMinuteOffset(event.start!, selectedDay);
            const endMinute = getEndMinute(event, startMinute, selectedDay);
            return {
                event,
                startMinute,
                endMinute,
                occupiedEnd: endMinute,
                roomIndex: rooms.findIndex((room) => room.value === event.room.name),
            };
        })
        .sort(
            (first, second) =>
                first.roomIndex - second.roomIndex ||
                first.startMinute - second.startMinute ||
                first.endMinute - second.endMinute
        );

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

export const getCalendarTimeLabel = (offsetMinutes: number): string => {
    const totalMinutes = parseClockTime(conNewDayEventStartTime) + offsetMinutes;
    const dayOffset = Math.floor(totalMinutes / 1440);
    const minutes = totalMinutes % 1440;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}${dayOffset > 0 ? ` +${dayOffset}` : ""}`;
};

export const getCalendarDays = (events: EventSlot[]): CalendarDay[] => {
    const seen = new Set<string>();
    const candidates = events.flatMap((event) => {
        if (!event.start) {
            return [];
        }

        const values = [getScheduleDayKey(event.start)];
        const end = getEventEndIso(event);

        if (end) {
            values.push(getScheduleDayKey(end));
        }

        return values;
    });

    return candidates.flatMap((value) => {
        if (seen.has(value) || !events.some((event) => eventOverlapsScheduleDay(event, value))) {
            return [];
        }

        seen.add(value);

        return [
            {
                value,
                label: formatScheduleDay(value),
                eventsCount: events.filter((event) => eventOverlapsScheduleDay(event, value))
                    .length,
            },
        ];
    });
};
