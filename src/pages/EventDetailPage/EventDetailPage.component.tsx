import { useParams } from "react-router-dom";

import { useSchedule } from "../../hooks/useSchedule";
import { BackLink, Panel, Pre } from "./EventDetailPage.styled";

export const EventDetailPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { data, isLoading } = useSchedule();

    const event = data?.events.find((candidate) => String(candidate.id) === eventId);

    return isLoading ? (
        <Panel>Loading...</Panel>
    ) : (
        <Panel>
            <BackLink to="/">Back to schedule</BackLink>
            {event ? <Pre>{JSON.stringify(event, null, 2)}</Pre> : <p>Event not found.</p>}
        </Panel>
    );
};
