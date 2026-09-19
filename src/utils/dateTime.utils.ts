import { isWithinInterval } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { conTimeZone } from "../configuration";

/** Formats ISO event time in the configured local timezone */
export const formatEventTime = (dateTimeIso: string): string =>
    formatInTimeZone(new Date(dateTimeIso), conTimeZone, "HH:mm");

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
