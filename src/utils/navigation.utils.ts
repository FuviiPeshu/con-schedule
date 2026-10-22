/** Router state attached to links that leave the schedule, so the way back can restore its position */
const openedFromScheduleState = { fromSchedule: true } as const;
/** Router state asking the schedule to drop its saved position and start from the top of the list */
const resetScheduleState = { resetSchedule: true } as const;

const hasStateFlag = (state: unknown, flag: string): boolean =>
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>)[flag] === true;

export const isOpenedFromSchedule = (state: unknown): boolean =>
    hasStateFlag(state, "fromSchedule");

export const isScheduleReset = (state: unknown): boolean => hasStateFlag(state, "resetSchedule");

/** Link props for an event detail page; `search` carries the schedule's filters and position */
export const getEventLinkProps = (eventId: number, search: string) => ({
    to: { pathname: `/event/${eventId}`, search },
    state: openedFromScheduleState,
});

/** Preserves schedule position when returning from it; otherwise uses the fallback query and resets */
export const getScheduleLinkProps = (state: unknown, search: string, fallbackSearch: string) =>
    isOpenedFromSchedule(state)
        ? { to: { pathname: "/", search }, state: openedFromScheduleState }
        : { to: { pathname: "/", search: fallbackSearch }, state: resetScheduleState };
