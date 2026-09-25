import { isWithinInterval } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { conNewDayEventStartTime, conTimeZone } from "../configuration";
import { FeedState, FeedStateEnum } from "../schedule.types";

/** Formats ISO event time in the configured local timezone */
export const formatEventTime = (dateTimeIso: string): string =>
    formatInTimeZone(new Date(dateTimeIso), conTimeZone, "HH:mm");

/** Formats ISO event date in the configured local timezone */
export const formatEventDate = (dateTimeIso: string): string =>
    formatInTimeZone(new Date(dateTimeIso), conTimeZone, "EEEE, MMM d");

/** Formats a schedule day key into a readable local date string */
export const formatScheduleDay = (dayKey: string): string =>
    formatInTimeZone(fromZonedTime(`${dayKey}T12:00:00`, conTimeZone), conTimeZone, "EEEE, MMM d");

/** Gets the total event time in minutes (from datetime string) */
export const getEventLocalMinutes = (dateTimeIso: string): number => {
    const [hours, minutes] = formatEventTime(dateTimeIso).split(":").map(Number);
    return hours * 60 + minutes;
};

/** Parses clocklike time string (HH:mm) into total minutes */
export const parseClockTime = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

/** Converts local date key into UTC Date at noon */
const localDateAsUtcNoon = (dateKey: string): Date => new Date(`${dateKey}T12:00:00Z`);

/** Formats UTC Date as local date key (yyyy-MM-dd) */
const formatUtcDateKey = (date: Date): string => date.toISOString().slice(0, 10);

/** Converts a convention-local date into an instant, keeping date-only config values timezone-safe */
export const parseConventionDate = (date: string, endOfDay = false): Date =>
    fromZonedTime(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00"}`, conTimeZone);

/**
 * Determines current feed state based on the current time and the start and end times of the feed
 * @param now Current datetime
 * @param startDate Start datetime of the feed (ISO string or null)
 * @param endDate End datetime of the feed (ISO string or null)
 * @returns The current feed state ("Countdown", "Online" or "Offline")
 */
export const getFeedState = (
    now: Date,
    startDate: string | null,
    endDate: string | null
): FeedState => {
    const start = startDate ? parseConventionDate(startDate) : null;
    const end = endDate ? parseConventionDate(endDate, true) : null;

    if (start && now < start) {
        return FeedStateEnum.Countdown;
    } else if (end && now > end) {
        return FeedStateEnum.Offline;
    }
    return FeedStateEnum.Online;
};

/**
 * Formats the countdown to a target date from the current date in T-minus format
 * @param target Target datetime
 * @param now Current datetime
 * @returns Countdown string in the format "T-{days}d {hours}:{minutes}:{seconds}"
 */
export const formatCountdown = (target: Date, now: Date): string => {
    const totalSeconds = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 1000));
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");

    return `T-${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/** Gets the schedule day key for a given ISO datetime (considering the day start time)
 * @param dateTimeIso ISO datetime string of the event
 * @param newDayEventStartTime Local time at which the schedule day starts (default = configured new day start time)
 * @returns Schedule day key ("yyyy-MM-dd" format)
 */
export const getScheduleDayKey = (
    dateTimeIso: string,
    newDayEventStartTime: string = conNewDayEventStartTime
): string => {
    const localDateKey = formatInTimeZone(new Date(dateTimeIso), conTimeZone, "yyyy-MM-dd");

    if (getEventLocalMinutes(dateTimeIso) >= parseClockTime(newDayEventStartTime)) {
        return localDateKey;
    }

    const previousDate = localDateAsUtcNoon(localDateKey);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);

    return formatUtcDateKey(previousDate);
};

/** Gets the minute offset of an event within its schedule day
 * @param dateTimeIso ISO datetime string of the event
 * @param scheduleDayKey Schedule day key ("yyyy-MM-dd" format)
 * @param newDayEventStartTime Local time at which the schedule day starts (default = configured new day start time)
 * @returns Minute offset of the event within its schedule day
 */
export const getScheduleMinuteOffset = (
    dateTimeIso: string,
    scheduleDayKey: string,
    newDayEventStartTime: string = conNewDayEventStartTime
): number => {
    const localDateKey = formatInTimeZone(new Date(dateTimeIso), conTimeZone, "yyyy-MM-dd");
    const dayDifference =
        (localDateAsUtcNoon(localDateKey).getTime() -
            localDateAsUtcNoon(scheduleDayKey).getTime()) /
        60_000;

    return dayDifference + getEventLocalMinutes(dateTimeIso) - parseClockTime(newDayEventStartTime);
};

/** Formats an event duration from minutes to hours and minutes unless it's less than an hour
 * @param durationMinutes Duration of the event (in minutes)
 * @returns Easy to read event duration string (e.g. "1h 30m" or "45m")
 */
export const formatEventDuration = (durationMinutes: number): string => {
    if (durationMinutes < 60) {
        return `${durationMinutes}m`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
};

/**
 * Determines if an event is currently happening based on its start and end datetimes
 * @param startIso Start datetime of the event (ISO string or null)
 * @param endIso End datetime of the event (ISO string or null)
 * @param now Current datetime (defaults to the current system time)
 * @returns True if the event is _(or should be)_ happening, false otherwise
 */
export const isEventLive = (
    startIso: string | null,
    endIso: string | null,
    now: Date = new Date()
): boolean => {
    if (!startIso || !endIso) {
        return false;
    }
    return isWithinInterval(now, { start: new Date(startIso), end: new Date(endIso) });
};
