import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EXAMPLE_EVENT_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import { CompactEventComponent } from "./CompactEvent.component";

describe("Components / CompactEvent", () => {
    const renderEvent = (event = EXAMPLE_EVENT_MOCK_DATA, initialEntry = "/") =>
        render(
            <MemoryRouter initialEntries={[initialEntry]}>
                <CompactEventComponent event={event} />
            </MemoryRouter>
        );

    it("should show title, room, type and duration", () => {
        renderEvent();

        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.title)).toBeInTheDocument();
        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.room.name)).toBeInTheDocument();
        expect(screen.getByText("Talk / 30m")).toBeInTheDocument();
    });

    it("should link to the event while keeping the schedule query", () => {
        renderEvent(EXAMPLE_EVENT_MOCK_DATA, "/?room=Auditorium&date=2026-08-20&page=1");

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/event/621?room=Auditorium&date=2026-08-20&page=1"
        );
    });
});
