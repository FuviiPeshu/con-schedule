import { ScheduleView } from "../schedule.types";

interface ResolveScheduleViewParams {
    searchParams: URLSearchParams;
    /** Set when the user was sent back to a fresh schedule (e.g. from a missing page) */
    reset: boolean;
    /** The last view the user picked, used when the URL says nothing */
    storedView: ScheduleView;
}

/** Resolves URL: `date` selects Calendar, `page` selects List, otherwise use the stored view */
export const resolveScheduleView = ({
    searchParams,
    reset,
    storedView,
}: ResolveScheduleViewParams): ScheduleView => {
    if (reset) {
        return ScheduleView.List;
    }

    if (searchParams.has("page")) {
        return ScheduleView.List;
    }

    return searchParams.has("date") ? ScheduleView.Calendar : storedView;
};
