import { useLocation } from "react-router-dom";

import type { EventSlot } from "../../api";
import { formatEventDuration, formatEventTime } from "../../utils/dateTime.utils";
import { getEventLinkProps } from "../../utils/navigation.utils";
import {
    CardArrow,
    CardArrowIcon,
    CardArrowLabel,
    CardContent,
    CardMeta,
    CardWrapper,
    Description,
    Duration,
    Location,
    MetaItem,
    TimeBlock,
    TimeEnd,
    TimeStart,
    Title,
    TitleRow,
} from "./EventCard.styled";

interface EventCardProps {
    event: EventSlot;
}

export const EventCardComponent = ({ event }: EventCardProps) => {
    const location = useLocation();

    return (
        <CardWrapper
            {...getEventLinkProps(event.id, location.search)}
            $trackColor={event.track.color}
        >
            <TimeBlock>
                <TimeStart>{event.start ? formatEventTime(event.start) : "TBD"}</TimeStart>
                <TimeEnd>{event.end ? `to ${formatEventTime(event.end)}` : "Open window"}</TimeEnd>
                {event.duration > 0 && <Duration>({formatEventDuration(event.duration)})</Duration>}
            </TimeBlock>
            <CardContent>
                <TitleRow>
                    <Title>{event.title}</Title>
                    <Location title={event.room.name}>{event.room.name}</Location>
                </TitleRow>
                <Description>
                    {event.raw_abstract || event.raw_description || "No description available."}
                </Description>
                <CardMeta>
                    <MetaItem>{event.submission_type}</MetaItem>
                    {event.speakers.length > 0 && (
                        <MetaItem>
                            {event.speakers.map((speaker) => speaker.name).join(", ")}
                        </MetaItem>
                    )}
                    {event.tags.map((tag) => (
                        <MetaItem key={tag.id}>{tag.tag}</MetaItem>
                    ))}
                </CardMeta>
            </CardContent>
            <CardArrow aria-hidden="true">
                <CardArrowLabel>Inspect</CardArrowLabel>
                <CardArrowIcon>&gt;</CardArrowIcon>
            </CardArrow>
        </CardWrapper>
    );
};
