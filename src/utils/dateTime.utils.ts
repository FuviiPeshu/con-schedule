import { isWithinInterval } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { conNewDayEventStartTime, conTimeZone } from "../configuration";
import { EventState, FeedState } from "../schedule.types";

/** Parses clocklike time string (HH:mm) into total minutes */
export const parseClockTime = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

type LocalDateTime = { dateKey: string; time: string; minutes: number };

const localDateTimeCache = new Map<string, LocalDateTime>(); // timezone formatting is slow and schedule helpers hit the same few hundred timestamps repeatedly

/** Parses each ISO timestamp once in the convention timezone, then reuses its local parts */
const getLocalDateTime = (dateTimeIso: string): LocalDateTime => {
    const cached = localDateTimeCache.get(dateTimeIso);

    if (cached) {
        return cached;
    }

    const [dateKey, time] = formatInTimeZone(
        new Date(dateTimeIso),
        conTimeZone,
        "yyyy-MM-dd HH:mm"
    ).split(" ");
    const localDateTime = { dateKey, time, minutes: parseClockTime(time) };

    localDateTimeCache.set(dateTimeIso, localDateTime);

    return localDateTime;
};

/** Replaces the space before the day number so "Aug 20" never wraps */
const keepDayNumberAttached = (formattedDate: string): string =>
    formattedDate.replace(/ (?=\S+$)/, "\u00A0");

/** Formats ISO timestamp as convention-local HH:mm */
export const formatEventTime = (dateTimeIso: string): string => getLocalDateTime(dateTimeIso).time;

/** Formats ISO timestamp as a convention-local date */
export const formatEventDate = (dateTimeIso: string): string =>
    keepDayNumberAttached(formatInTimeZone(new Date(dateTimeIso), conTimeZone, "EEEE, MMM d"));

/** Formats convention-day key as a readable local date */
export const formatScheduleDay = (dayKey: string): string =>
    keepDayNumberAttached(
        formatInTimeZone(
            fromZonedTime(`${dayKey}T12:00:00`, conTimeZone),
            conTimeZone,
            "EEEE, MMM d"
        )
    );

/** Gets total event time in minutes (from datetime string) */
export const getEventLocalMinutes = (dateTimeIso: string): number =>
    getLocalDateTime(dateTimeIso).minutes;

/** Uses UTC noon to shift date keys without timezone or DST rollover */
const localDateAsUtcNoon = (dateKey: string): Date => new Date(`${dateKey}T12:00:00Z`);

/** Formats UTC Date as local date key (yyyy-MM-dd) */
const formatUtcDateKey = (date: Date): string => date.toISOString().slice(0, 10);

/** Converts a convention-local date into an instant, keeping date-only config values timezone-safe */
export const parseConventionDate = (date: string, endOfDay = false): Date =>
    fromZonedTime(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00"}`, conTimeZone);

/** Returns Countdown before start, Archive after end, and Live otherwise; missing bounds are open */
export const getFeedState = (
    now: Date,
    startDate: string | null,
    endDate: string | null
): FeedState => {
    const start = startDate ? parseConventionDate(startDate) : null;
    const end = endDate ? parseConventionDate(endDate, true) : null;

    if (start && now < start) {
        return FeedState.Countdown;
    } else if (end && now > end) {
        return FeedState.Archive;
    }
    return FeedState.Live;
};

/** Formats remaining time as T-{days}d HH:mm:ss, clamped to zero */
export const formatCountdown = (target: Date, now: Date): string => {
    const totalSeconds = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 1000));
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");

    return `T-${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/** Maps instant to its convention day, using the configured day start (06:00 by default) */
export const getScheduleDayKey = (
    dateTimeIso: string,
    newDayEventStartTime: string = conNewDayEventStartTime
): string => {
    const { dateKey: localDateKey, minutes } = getLocalDateTime(dateTimeIso);

    if (minutes >= parseClockTime(newDayEventStartTime)) {
        return localDateKey;
    }

    const previousDate = localDateAsUtcNoon(localDateKey);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);

    return formatUtcDateKey(previousDate);
};

/** Returns minutes from the configured start of the given convention day */
export const getScheduleMinuteOffset = (
    dateTimeIso: string,
    scheduleDayKey: string,
    newDayEventStartTime: string = conNewDayEventStartTime
): number => {
    const { dateKey: localDateKey, minutes } = getLocalDateTime(dateTimeIso);
    const dayDifference =
        (localDateAsUtcNoon(localDateKey).getTime() -
            localDateAsUtcNoon(scheduleDayKey).getTime()) /
        60_000;

    return dayDifference + minutes - parseClockTime(newDayEventStartTime);
};

/** Formats minutes as hours plus remaining minutes when needed */
export const formatEventDuration = (durationMinutes: number): string => {
    if (durationMinutes < 60) {
        return `${durationMinutes}m`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
};

/** Returns true when now is within the complete event interval, including both endpoints */
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

/** Classifies event as Upcoming, Live, Finished, or Unknown from its timestamps */
export const getEventState = (start: string | null, end: string | null): EventState => {
    if (isEventLive(start, end)) {
        return EventState.Live;
    } else if (start && new Date(start).getTime() > Date.now()) {
        return EventState.Upcoming;
    } else if (end && new Date(end).getTime() < Date.now()) {
        return EventState.Finished;
    }
    return EventState.Unknown;
};
