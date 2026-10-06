import { useLocation } from "react-router-dom";

import type { EventSlot } from "../../api";
import { formatEventDuration } from "../../utils/dateTime.utils";
import {
    CompactEventLink,
    CompactEventMeta,
    CompactEventRoom,
    CompactEventTitle,
} from "./CompactEvent.styled";

type CompactEventProps = {
    event: EventSlot;
};

export const CompactEventComponent = ({ event }: CompactEventProps) => {
    const location = useLocation();

    return (
        <CompactEventLink
            to={{ pathname: `/event/${event.id}`, search: location.search }}
            state={{ fromSchedule: true }}
            $trackColor={event.track.color}
        >
            <CompactEventTitle>{event.title}</CompactEventTitle>
            <CompactEventRoom>{event.room.name}</CompactEventRoom>
            <CompactEventMeta>
                {event.submission_type} / {formatEventDuration(event.duration)}
            </CompactEventMeta>
        </CompactEventLink>
    );
};
