import { useCallback, useRef } from "react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { EXAMPLE_EVENT_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import type { EventSlot } from "../../api";
import { ListDisplayMode } from "../../schedule.types";
import { ListViewComponent } from "./ListView.component";

const makeEvent = (
    id: number,
    title: string,
    start: string | null,
    room = "Auditorium"
): EventSlot => ({
    ...EXAMPLE_EVENT_MOCK_DATA,
    id,
    title,
    start,
    end: start?.replace(":00+02:00", ":30+02:00") ?? null,
    duration: 30,
    room: { id: 1, name: room },
});

const onDay = (day: number, hour = 10) =>
    `2026-08-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00+02:00`;

interface HarnessProps {
    events: EventSlot[];
    filteredEvents?: EventSlot[];
    displayMode?: ListDisplayMode;
}

// Makes pagination and day changes observable
const Harness = ({
    events,
    filteredEvents = events,
    displayMode = ListDisplayMode.Full,
}: HarnessProps) => {
    const [, setSearchParams] = useSearchParams();
    const scheduleContentRef = useRef<HTMLDivElement>(null);
    const updateSearchParams = useCallback(
        (update: (params: URLSearchParams) => void) =>
            setSearchParams(
                (current) => {
                    const next = new URLSearchParams(current);
                    update(next);
                    return next;
                },
                { replace: true }
            ),
        [setSearchParams]
    );

    return (
        <div ref={scheduleContentRef} data-testid="content">
            <ListViewComponent
                events={events}
                filteredEvents={filteredEvents}
                scheduleContentRef={scheduleContentRef}
                updateSearchParams={updateSearchParams}
                displayMode={displayMode}
            />
        </div>
    );
};

const renderList = (props: HarnessProps, entry = "/") =>
    render(
        <MemoryRouter initialEntries={[entry]}>
            <Harness {...props} />
        </MemoryRouter>
    );

const pageElements = {
    get pageSizeSelect() {
        return screen.getByRole("combobox", { name: "Page size (top)" });
    },
    get nextPageBottomButton() {
        return screen.getByRole("button", { name: "Next page (bottom)" });
    },
    get paginationBars() {
        return [
            screen.getByRole("navigation", { name: "Schedule pagination (top)" }),
            screen.getByRole("navigation", { name: "Schedule pagination (bottom)" }),
        ];
    },
};

describe("Components / ListView", () => {
    const elevenDays = Array.from({ length: 11 }, (_, index) =>
        makeEvent(100 + index, `Pagination event ${index + 1}`, onDay(20 + index))
    );

    beforeEach(() => {
        window.localStorage.clear();
    });

    describe("pagination", () => {
        it("should page through events and return to the top on each change", async () => {
            const user = userEvent.setup();
            renderList({ events: elevenDays });

            expect(screen.getAllByText("Page 1 / 2")).toHaveLength(2);
            expect(screen.getByText("Pagination event 1")).toBeInTheDocument();
            expect(screen.queryByText("Pagination event 11")).not.toBeInTheDocument();

            const content = screen.getByTestId("content");
            content.scrollTop = 120;
            await user.click(pageElements.nextPageBottomButton);

            expect(content.scrollTop).toBe(0);
            expect(screen.getAllByText("Page 2 / 2")).toHaveLength(2);
            expect(screen.getByText("Pagination event 11")).toBeInTheDocument();
        });

        it("should stay on the first visible event when the page size changes", async () => {
            const user = userEvent.setup();
            renderList({ events: elevenDays }, "/?page=2");

            await user.selectOptions(pageElements.pageSizeSelect, "5");

            expect(screen.getAllByText("Page 3 / 3")).toHaveLength(2);
            expect(screen.getByText("Pagination event 11")).toBeInTheDocument();
        });
    });

    describe("FULL DAY pages", () => {
        const events = [
            makeEvent(1, "Thursday opening", onDay(20, 10)),
            makeEvent(2, "Thursday filtered out", onDay(20, 11)),
            makeEvent(3, "Friday event", onDay(21, 10)),
        ];
        const filteredEvents = [events[0], events[2]];

        it("should show one schedule day per page with filtered/total counts", async () => {
            const user = userEvent.setup();
            renderList({ events, filteredEvents });

            await user.selectOptions(pageElements.pageSizeSelect, "full-day");

            pageElements.paginationBars.forEach((pagination) => {
                expect(within(pagination).getByText("Showing 1 / 2 items")).toBeInTheDocument();
                expect(within(pagination).getByText(/Thursday,\s+Aug\s+20/)).toBeInTheDocument();
            });
            expect(screen.getByText("Thursday opening")).toBeInTheDocument();
            expect(screen.queryByText("Friday event")).not.toBeInTheDocument();

            await user.click(pageElements.nextPageBottomButton);

            expect(screen.getByText("Friday event")).toBeInTheDocument();
            expect(screen.queryByText("Thursday opening")).not.toBeInTheDocument();
            pageElements.paginationBars.forEach((pagination) => {
                expect(within(pagination).getByText("Showing 1 / 1 items")).toBeInTheDocument();
            });
        });

        it("should open day named in the URL as a FULL DAY page", () => {
            renderList({ events, filteredEvents }, "/?date=2026-08-21&page=1");

            expect(pageElements.pageSizeSelect).toHaveValue("full-day");
            expect(screen.getByText("Friday event")).toBeInTheDocument();
            expect(screen.queryByText("Thursday opening")).not.toBeInTheDocument();
        });

        it("should list unscheduled events on their own page", () => {
            const unscheduled = makeEvent(4, "Unscheduled event", null);

            renderList({ events: [...events, unscheduled] }, "/?date=Unscheduled&page=1");

            expect(screen.getByText("Unscheduled event")).toBeInTheDocument();
            expect(screen.getAllByText("Unscheduled").length).toBeGreaterThan(0);
        });
    });

    describe("compact mode", () => {
        it("should group events starting at the same time into one row", () => {
            const events = [
                makeEvent(1, "Opening Ceremony", onDay(20, 16)),
                makeEvent(2, "Second same-start event", onDay(20, 16), "Second Room"),
            ];

            renderList({ events, displayMode: ListDisplayMode.Compact });

            expect(screen.getByRole("group", { name: "Compact event list" })).toBeInTheDocument();
            expect(screen.getAllByText("16:00")).toHaveLength(1);
            expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
            expect(screen.getByText("Second same-start event")).toBeInTheDocument();
        });

        it("should paginate by rows rather than events", async () => {
            const user = userEvent.setup();
            const events = [
                makeEvent(1, "Row 1 first", onDay(20, 10)),
                makeEvent(2, "Row 1 second", onDay(20, 10), "Second Room"),
                ...Array.from({ length: 5 }, (_, index) =>
                    makeEvent(10 + index, `Row ${index + 2}`, onDay(20, 11 + index))
                ),
            ];

            renderList({ events, displayMode: ListDisplayMode.Compact });
            await user.selectOptions(pageElements.pageSizeSelect, "5");

            expect(screen.getAllByText("Showing 1-5 / 6 rows")).toHaveLength(2);
            expect(screen.getByText("Row 5")).toBeInTheDocument();
            expect(screen.queryByText("Row 6")).not.toBeInTheDocument();
        });
    });

    describe("empty states", () => {
        it("should say when there are no events at all", () => {
            renderList({ events: [] });

            expect(screen.getByText("No events found.")).toBeInTheDocument();
        });

        it("should say when the filters match nothing", () => {
            renderList({ events: elevenDays, filteredEvents: [] });

            expect(screen.getByText("No events match current filters.")).toBeInTheDocument();
        });
    });
});
