import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EXAMPLE_EVENT_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import { EventCardComponent } from "./EventCard.component";

describe("Components / EventCard", () => {
    const renderCard = (initialEntry = "/") =>
        render(
            <MemoryRouter initialEntries={[initialEntry]}>
                <EventCardComponent event={EXAMPLE_EVENT_MOCK_DATA} />
            </MemoryRouter>
        );

    it("should render event title and description", () => {
        renderCard();

        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.title)).toBeInTheDocument();
        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.raw_description)).toBeInTheDocument();
        expect(screen.getByText("(30m)")).toBeInTheDocument();
        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.room.name)).toBeInTheDocument();
        expect(screen.queryByText(EXAMPLE_EVENT_MOCK_DATA.track.name)).not.toBeInTheDocument();
        expect(
            screen.queryByText(`Specimen / ${EXAMPLE_EVENT_MOCK_DATA.code}`)
        ).not.toBeInTheDocument();
    });

    it("should preserve schedule query state when opening an event", () => {
        renderCard("/?room=Auditorium&page=2");

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/event/621?room=Auditorium&page=2"
        );
    });

    it("should not render a 'stray' zero for events without a duration", () => {
        render(
            <MemoryRouter>
                <EventCardComponent event={{ ...EXAMPLE_EVENT_MOCK_DATA, duration: 0 }} />
            </MemoryRouter>
        );

        expect(screen.queryByText("0")).not.toBeInTheDocument();
        expect(screen.queryByText(/^\(/)).not.toBeInTheDocument();
    });

    it("should fall back to placeholders for unscheduled events", () => {
        render(
            <MemoryRouter>
                <EventCardComponent
                    event={{ ...EXAMPLE_EVENT_MOCK_DATA, start: null, end: null, raw_abstract: "" }}
                />
            </MemoryRouter>
        );

        expect(screen.getByText("TBD")).toBeInTheDocument();
        expect(screen.getByText("Open window")).toBeInTheDocument();
        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.raw_description)).toBeInTheDocument();
    });
});
