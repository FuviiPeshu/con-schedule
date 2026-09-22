import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EXAMPLE_EVENT_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import { EventCard } from "./EventCard.component";

describe("Components / EventCard", () => {
    const renderCard = () =>
        render(
            <BrowserRouter>
                <EventCard event={EXAMPLE_EVENT_MOCK_DATA} />
            </BrowserRouter>
        );

    it("should render event title and description", () => {
        renderCard();

        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.title)).toBeInTheDocument();
        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.description)).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: new RegExp(EXAMPLE_EVENT_MOCK_DATA.title) })
        ).toHaveAttribute("href", `/event/${EXAMPLE_EVENT_MOCK_DATA.id}`);
    });
});
