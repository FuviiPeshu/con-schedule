import { useLocation } from "react-router-dom";

import type { EventSlot } from "../../api";
import { formatEventDuration } from "../../utils/dateTime.utils";
import { getEventLinkProps } from "../../utils/navigation.utils";
import {
    CompactEventLink,
    CompactEventMeta,
    CompactEventRoom,
    CompactEventTitle,
} from "./CompactEvent.styled";

interface CompactEventProps {
    event: EventSlot;
}

export const CompactEventComponent = ({ event }: CompactEventProps) => {
    const location = useLocation();

    return (
        <CompactEventLink
            {...getEventLinkProps(event.id, location.search)}
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
