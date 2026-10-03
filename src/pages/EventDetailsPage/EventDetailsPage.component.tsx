import { useLocation, useParams } from "react-router-dom";

import { useSchedule } from "../../hooks/useSchedule";
import { EventState } from "../../schedule.types";
import {
    formatEventDate,
    formatEventDuration,
    formatEventTime,
    getEventState,
} from "../../utils/dateTime.utils";
import { renderEventHtml } from "../../utils/text.utils";
import {
    BackArrow,
    BackLink,
    DetailsBodySection,
    DetailsHeader,
    DetailsHeaderDetails,
    DetailsLayout,
    DetailsRail,
    DetailsTitle,
    DetailsWrapper,
    EventAbstract,
    InfoBlock,
    InfoBlockGrid,
    InfoLabel,
    InfoValue,
    MetaList,
    MetaPanel,
    Panel,
    StatusPill,
    Tag,
    TrackMark,
} from "./EventDetailsPage.styled";

export const EventDetailsPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const location = useLocation();
    const { data, isLoading } = useSchedule();

    const openedFromSchedule = location.state?.fromSchedule === true;
    const event = data?.events.find((candidate) => String(candidate.id) === eventId);

    return isLoading ? (
        <Panel>Loading event data...</Panel>
    ) : (
        <Panel>
            <BackLink
                to={
                    openedFromSchedule
                        ? { pathname: "/", search: location.search }
                        : { pathname: "/", search: "?page=1" }
                }
                state={openedFromSchedule ? { fromSchedule: true } : { resetSchedule: true }}
            >
                <BackArrow aria-hidden="true">&lt;</BackArrow>
                Back to schedule
            </BackLink>
            {event ? (
                <DetailsWrapper>
                    <DetailsHeader $trackColor={event.track.color}>
                        <DetailsHeaderDetails>
                            <span>Event record / {event.code}</span>
                            <StatusPill $state={getEventState(event.start, event.end)}>
                                {getEventState(event.start, event.end) === EventState.Live
                                    ? "Live now"
                                    : getEventState(event.start, event.end)}
                            </StatusPill>
                        </DetailsHeaderDetails>
                        <DetailsTitle>{event.title}</DetailsTitle>
                        <EventAbstract>
                            {renderEventHtml(event.abstract || "No event abstract available.")}
                        </EventAbstract>
                    </DetailsHeader>

                    <InfoBlockGrid>
                        <InfoBlock>
                            <InfoLabel>Start</InfoLabel>
                            {event.start ? (
                                <>
                                    <InfoValue>{formatEventDate(event.start)}</InfoValue>
                                    <InfoValue>{formatEventTime(event.start)}</InfoValue>
                                </>
                            ) : (
                                <InfoValue>Unscheduled</InfoValue>
                            )}
                        </InfoBlock>
                        <InfoBlock>
                            <InfoLabel>End</InfoLabel>
                            {event.end ? (
                                <>
                                    <InfoValue>{formatEventDate(event.end)}</InfoValue>
                                    <InfoValue>{formatEventTime(event.end)}</InfoValue>
                                </>
                            ) : (
                                <InfoValue>Open window</InfoValue>
                            )}
                        </InfoBlock>
                        <InfoBlock>
                            <InfoLabel>Duration</InfoLabel>
                            <InfoValue>
                                {event.duration ? formatEventDuration(event.duration) : "Unknown"}
                            </InfoValue>
                        </InfoBlock>
                        <InfoBlock>
                            <InfoLabel>Location</InfoLabel>
                            <InfoValue>{event.room.name}</InfoValue>
                        </InfoBlock>
                    </InfoBlockGrid>

                    <DetailsLayout>
                        <DetailsBodySection>
                            <InfoLabel>Description</InfoLabel>
                            {renderEventHtml(
                                event.description || event.abstract || "No description available."
                            )}
                        </DetailsBodySection>
                        <DetailsRail>
                            {event.speakers.length > 0 && (
                                <MetaPanel>
                                    <InfoLabel>Speakers</InfoLabel>
                                    <InfoValue>
                                        {event.speakers.map((speaker) => (
                                            <li key={speaker.code}>{speaker.name}</li>
                                        ))}
                                    </InfoValue>
                                </MetaPanel>
                            )}
                            <MetaPanel>
                                <InfoLabel>Track</InfoLabel>
                                <InfoValue>
                                    <TrackMark $trackColor={event.track.color} aria-hidden="true" />
                                    {event.track.name}
                                </InfoValue>
                            </MetaPanel>
                            <MetaPanel>
                                <InfoLabel>Tags</InfoLabel>
                                {event.tags.length > 0 ? (
                                    <MetaList>
                                        {event.tags.map((tag) => (
                                            <Tag key={tag.id}>{tag.tag}</Tag>
                                        ))}
                                    </MetaList>
                                ) : (
                                    <InfoValue>No tags assigned</InfoValue>
                                )}
                            </MetaPanel>
                            <MetaPanel>
                                <InfoLabel>Type</InfoLabel>
                                <InfoValue>{event.submission_type}</InfoValue>
                            </MetaPanel>
                        </DetailsRail>
                    </DetailsLayout>
                </DetailsWrapper>
            ) : (
                <DetailsBodySection>
                    <InfoLabel>Record unavailable</InfoLabel>
                    <p>Event not found...</p>
                </DetailsBodySection>
            )}
        </Panel>
    );
};
