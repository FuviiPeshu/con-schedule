import { useState } from "react";
import { useParams } from "react-router-dom";

import { BackToScheduleLinkComponent } from "../../components/BackToScheduleLink";
import { ModalComponent } from "../../components/Modal";
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
    DetailsBodySection,
    DetailsHeader,
    DetailsHeaderDetails,
    DetailsLayout,
    DetailsRail,
    DetailsTitle,
    DetailsWrapper,
    EventAbstract,
    EventFullscreenImage,
    EventImage,
    EventImageFrame,
    InfoBlock,
    InfoBlockGrid,
    InfoLabel,
    InfoValue,
    MetaList,
    MetaPanel,
    Panel,
    SpeakerList,
    StatusPill,
    Tag,
    TrackMark,
} from "./EventDetailsPage.styled";

interface ImageOrientationState {
    image: string;
    portrait: boolean;
}

export const EventDetailsPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { data, isLoading } = useSchedule();
    const [imageOpen, setImageOpen] = useState(false);
    const [imageOrientation, setImageOrientation] = useState<ImageOrientationState | null>(null);

    const event = data?.events.find((candidate) => String(candidate.id) === eventId);
    const imageUrl = event?.image ?? "";
    const portraitImage =
        imageUrl !== "" && imageOrientation?.image === imageUrl && imageOrientation.portrait;
    const eventState = event ? getEventState(event.start, event.end) : EventState.Unknown;

    const handleImageLoad = (loadEvent: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const { naturalWidth, naturalHeight } = loadEvent.currentTarget;

        if (naturalWidth > 0 && naturalHeight > 0) {
            setImageOrientation({
                image: imageUrl,
                portrait: naturalWidth <= naturalHeight,
            });
        }
    };

    return isLoading ? (
        <Panel>Loading event data...</Panel>
    ) : (
        <Panel>
            <BackToScheduleLinkComponent fallbackSearch="?page=1" />
            {event ? (
                <DetailsWrapper>
                    <DetailsHeader $trackColor={event.track.color} $hasImage={Boolean(imageUrl)}>
                        {imageUrl && (
                            <EventImageFrame
                                type="button"
                                aria-label={`Open full-screen image for ${event.title}`}
                                aria-haspopup="dialog"
                                aria-controls="event-image-dialog"
                                $portrait={portraitImage}
                                onClick={() => setImageOpen(true)}
                            >
                                <EventImage
                                    src={imageUrl}
                                    alt=""
                                    $portrait={portraitImage}
                                    onLoad={handleImageLoad}
                                />
                            </EventImageFrame>
                        )}
                        <DetailsHeaderDetails>
                            <span>Event record / {event.code}</span>
                            <StatusPill $state={eventState}>
                                {eventState === EventState.Live ? "Live now" : eventState}
                            </StatusPill>
                        </DetailsHeaderDetails>
                        <DetailsTitle>{event.title}</DetailsTitle>
                        <EventAbstract>
                            {renderEventHtml(event.abstract || "No event abstract available.")}
                        </EventAbstract>
                    </DetailsHeader>
                    {imageUrl && (
                        <ModalComponent
                            open={imageOpen}
                            onClose={() => setImageOpen(false)}
                            id="event-image-dialog"
                            label={`${event.title} image viewer`}
                            closeLabel="Close image"
                        >
                            <EventFullscreenImage
                                src={imageUrl}
                                alt={`${event.title} event image`}
                            />
                        </ModalComponent>
                    )}

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
                                    <SpeakerList>
                                        {event.speakers.map((speaker) => (
                                            <li key={speaker.code}>{speaker.name}</li>
                                        ))}
                                    </SpeakerList>
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
