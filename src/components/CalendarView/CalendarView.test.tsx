import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    EXAMPLE_EVENT_MOCK_DATA,
    OTHER_EXAMPLE_EVENT_MOCK_DATA,
} from "../../__mocks__/schedule.mocks";
import type { EventSlot } from "../../api";
import { CalendarOrientation } from "../../schedule.types";
import { CalendarViewComponent } from "./CalendarView.component";

const opening = EXAMPLE_EVENT_MOCK_DATA; // Auditorium, 2026-08-20
const secondRoom: EventSlot = {
    ...EXAMPLE_EVENT_MOCK_DATA,
    id: 622,
    title: "Second room event",
    room: { id: 2, name: "Second Room" },
};
const lounge = OTHER_EXAMPLE_EVENT_MOCK_DATA; // Fursuit Lounge, 2026-08-21

const pageElements = {
    get openingEventLink() {
        return screen.getByRole("link", {
            name: "16:50 Opening Ceremony Auditorium / 30m",
        });
    },
    get secondRoomEventLink() {
        return screen.getByRole("link", {
            name: "16:50 Second room event Second Room / 30m",
        });
    },
    get secondRoomEventLinkIfPresent() {
        return screen.queryByRole("link", {
            name: "16:50 Second room event Second Room / 30m",
        });
    },
    get thursdayTab() {
        return screen.getByRole("tab", { name: "Thursday, Aug\u00A020 2 events" });
    },
    get fridayTab() {
        return screen.getByRole("tab", { name: "Friday, Aug\u00A021 1 events" });
    },
    get hideSecondRoomButton() {
        return screen.getByRole("button", { name: "Hide Second Room" });
    },
    get showSecondRoomButton() {
        return screen.getByRole("button", { name: "Show Second Room" });
    },
    get hideAuditoriumButton() {
        return screen.getByRole("button", { name: "Hide Auditorium" });
    },
    get swapOrientationButton() {
        return screen.getByRole("button", { name: "Swap columns and rows" });
    },
};

const readUpdateParams = (updateSearchParams: ReturnType<typeof vi.fn>, query = "") => {
    const params = new URLSearchParams(query);
    updateSearchParams.mock.calls[0][0](params);
    return params;
};

describe("Components / CalendarView", () => {
    const updateSearchParams = vi.fn();
    const onOrientationChange = vi.fn();

    const renderCalendar = ({
        events = [opening, secondRoom, lounge],
        filteredEvents = events,
        orientation = CalendarOrientation.Rooms,
        entry = "/?date=2026-08-20",
    }: {
        events?: EventSlot[];
        filteredEvents?: EventSlot[];
        orientation?: CalendarOrientation;
        entry?: string;
    } = {}) =>
        render(
            <MemoryRouter initialEntries={[entry]}>
                <CalendarViewComponent
                    events={events}
                    filteredEvents={filteredEvents}
                    scheduleContentRef={{ current: null }}
                    updateSearchParams={updateSearchParams}
                    orientation={orientation}
                    onOrientationChange={onOrientationChange}
                />
            </MemoryRouter>
        );

    beforeEach(() => {
        window.localStorage.clear();
        updateSearchParams.mockClear();
        onOrientationChange.mockClear();
    });

    it("should show selected day's events as links that keep the schedule query", () => {
        renderCalendar({ entry: "/?date=2026-08-20&room=Auditorium" });

        expect(pageElements.openingEventLink).toHaveAttribute(
            "href",
            "/event/621?date=2026-08-20&room=Auditorium"
        );
        expect(pageElements.secondRoomEventLink).toBeInTheDocument();
        expect(screen.queryByText("Fursuit Lounge - Fri")).not.toBeInTheDocument();
    });

    it("should mark selected day and select another one through the URL", () => {
        renderCalendar();

        expect(pageElements.thursdayTab).toHaveAttribute("aria-selected", "true");

        fireEvent.click(pageElements.fridayTab);

        expect(readUpdateParams(updateSearchParams, "page=2").get("date")).toBe("2026-08-21");
    });

    it("should disable days without matching events but keep them visible", () => {
        renderCalendar({ filteredEvents: [lounge], entry: "/?date=2026-08-21" });

        expect(pageElements.thursdayTab).toBeDisabled();
        expect(pageElements.fridayTab).toBeEnabled();
    });

    it("should hide a room, list it as hidden, and show it again", () => {
        renderCalendar();

        fireEvent.click(pageElements.hideSecondRoomButton);

        expect(pageElements.secondRoomEventLinkIfPresent).not.toBeInTheDocument();
        expect(pageElements.openingEventLink).toBeInTheDocument();

        fireEvent.click(pageElements.showSecondRoomButton);

        expect(pageElements.secondRoomEventLink).toBeInTheDocument();
    });

    it("should explain when every room of the day is hidden", () => {
        renderCalendar({ events: [opening], entry: "/?date=2026-08-20" });

        fireEvent.click(pageElements.hideAuditoriumButton);

        expect(
            screen.getByText(
                "All room columns are hidden. Remove at least one room from the hidden list above."
            )
        ).toBeInTheDocument();
    });

    it("should resize a room column from its header handle with the keyboard", () => {
        renderCalendar();

        const handle = screen.getByRole("button", { name: "Resize Auditorium column" });
        fireEvent.keyDown(handle, { key: "ArrowRight" });

        const storedWidths = JSON.parse(
            window.localStorage.getItem("con-schedule:EF30:calendar:room-widths") ?? "{}"
        ) as Record<string, number>;
        expect(storedWidths.Auditorium).toBe(266);
    });

    it("should explain when no event matches the filters", () => {
        renderCalendar({ filteredEvents: [] });

        expect(screen.getByText("No events match current filters.")).toBeInTheDocument();
    });

    it("should ask to swap between room and time orientation", () => {
        renderCalendar();

        fireEvent.click(pageElements.swapOrientationButton);

        expect(onOrientationChange).toHaveBeenCalledWith(CalendarOrientation.Times);
    });

    it("should render the same events in the time orientation", () => {
        renderCalendar({ orientation: CalendarOrientation.Times });

        expect(pageElements.openingEventLink).toBeInTheDocument();

        fireEvent.click(pageElements.swapOrientationButton);

        expect(onOrientationChange).toHaveBeenCalledWith(CalendarOrientation.Rooms);
    });
});
