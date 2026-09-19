import { EventCard } from "../../components/EventCard/EventCard.component";
import { useSchedule } from "../../hooks/useSchedule";
import { ErrorBanner, EventList, StatusText } from "./SchedulePage.styled";

export const SchedulePage = () => {
    const { data, isLoading, isError } = useSchedule();

    return isLoading ? (
        <StatusText>Loading schedule...</StatusText>
    ) : !data ? (
        <StatusText>No schedule data available.</StatusText>
    ) : (
        <>
            {isError && <ErrorBanner>Showing mock data.</ErrorBanner>}
            <EventList>
                {data.events.length === 0 && <StatusText>No events found.</StatusText>}
                {data.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </EventList>
        </>
    );
};
