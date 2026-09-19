import type { EventSlot } from "../../api/api.types";
import { Card, Pre, Title } from "./EventCard.styled";

type EventCardProps = {
    event: EventSlot;
};

export const EventCard = ({ event }: EventCardProps) => (
    <Card to={`/event/${event.id}`}>
        <Title>{event.title}</Title>
        <Pre>{event.description}</Pre>
    </Card>
);
