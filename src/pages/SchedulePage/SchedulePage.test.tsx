import { BrowserRouter } from "react-router-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SCHEDULE_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import { buildScheduleData } from "../../api";
import { useSchedule } from "../../hooks/useSchedule";
import { SchedulePage } from "./SchedulePage.component";

const pageElements = {
    get roomFilter() {
        return screen.getByRole("combobox", { name: "Filter by room" });
    },
    get dateFilter() {
        return screen.getByRole("combobox", { name: "Filter by date" });
    },
    get tagFilter() {
        return screen.getByRole("combobox", { name: "Filter by tag" });
    },
    get speakerFilter() {
        return screen.getByRole("combobox", { name: "Filter by speaker" });
    },
    get searchInput() {
        return screen.getByRole("searchbox", { name: "Search events" });
    },
    get clearFiltersButton() {
        return screen.getByRole("button", { name: "Clear filters" });
    },
};

describe("Pages / SchedulePage", () => {
    vi.mock("../../hooks/useSchedule", () => ({
        useSchedule: vi.fn(),
    }));

    const mockedUseSchedule = vi.mocked(useSchedule);
    const scheduleData = buildScheduleData(SCHEDULE_MOCK_DATA);
    const largeScheduleData = buildScheduleData({
        ...SCHEDULE_MOCK_DATA,
        days: Array.from({ length: 11 }, (_, index) => ({
            date: `2026-08-${String(20 + index).padStart(2, "0")}`,
            label: `Day ${index + 1}`,
            slots: [
                {
                    ...SCHEDULE_MOCK_DATA.days[0].slots[0],
                    id: 1000 + index,
                    title: `Pagination event ${index + 1}`,
                    start: `2026-08-${String(20 + index).padStart(2, "0")}T10:00:00+02:00`,
                    end: `2026-08-${String(20 + index).padStart(2, "0")}T10:30:00+02:00`,
                },
            ],
        })),
    });

    const renderPage = () =>
        render(
            <BrowserRouter>
                <SchedulePage />
            </BrowserRouter>
        );

    beforeEach(() => {
        window.localStorage.clear();
        window.history.replaceState({}, "", "/");
        mockedUseSchedule.mockReturnValue({
            data: scheduleData,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useSchedule>);
    });

    afterEach(() => {
        vi.useRealTimers();
        window.localStorage.clear();
        window.history.replaceState({}, "", "/");
    });

    it("should filter events by room and date", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(pageElements.roomFilter, "Fursuit Lounge");
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();
        expect(screen.queryByText("Opening Ceremony")).not.toBeInTheDocument();

        await user.click(pageElements.clearFiltersButton);
        await user.selectOptions(pageElements.dateFilter, "2026-08-20");
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.queryByText("Fursuit Lounge - Fri")).not.toBeInTheDocument();
    });

    it("should filter events by tag and speaker", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(pageElements.tagFilter, "Information");
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.queryByText("Fursuit Lounge - Fri")).not.toBeInTheDocument();

        await user.click(pageElements.clearFiltersButton);
        await user.selectOptions(pageElements.speakerFilter, "SPEAK2");
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.queryByText("Fursuit Lounge - Fri")).not.toBeInTheDocument();
    });

    it("should remove an single filter", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(pageElements.roomFilter, "Fursuit Lounge");
        await user.click(screen.getAllByRole("button", { name: "Remove room filter" })[0]);

        expect(pageElements.roomFilter).toHaveValue("");
        expect(screen.getAllByText("// NO FILTERS APPLIED").length).toBeGreaterThan(0);
    });

    it("should show removable applied filters when the control panel is collapsed", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(pageElements.roomFilter, "Fursuit Lounge");
        await user.selectOptions(pageElements.dateFilter, "2026-08-20");
        await user.click(screen.getByRole("button", { name: "Collapse filters" }));

        expect(screen.getByRole("group", { name: "Applied filters" })).toBeInTheDocument();
        expect(screen.getByTitle("ROOM: Fursuit Lounge")).toBeInTheDocument();
        expect(screen.getByTitle("DATE: 2026-08-20")).toBeInTheDocument();

        await user.click(screen.getByTitle("ROOM: Fursuit Lounge"));
        expect(screen.getByRole("button", { name: "Remove room filter" })).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Remove room filter" })
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Remove room filter" }));
        expect(screen.queryByTitle("ROOM: Fursuit Lounge")).not.toBeInTheDocument();
        expect(screen.getByTitle("DATE: 2026-08-20")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Clear all filters" }));
        expect(screen.queryByRole("group", { name: "Applied filters" })).not.toBeInTheDocument();
    });

    it("should return expanded compact filters to miniatures after the fade window", () => {
        vi.useFakeTimers();
        window.history.replaceState({}, "", "/?page=1&room=Fursuit%20Lounge");
        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Collapse filters" }));
        fireEvent.click(screen.getByTitle("ROOM: Fursuit Lounge"));

        const details = screen.getByRole("group", { name: "ROOM filter details" });
        fireEvent.mouseLeave(details);
        act(() => vi.advanceTimersByTime(250));
        fireEvent.mouseEnter(details);
        act(() => vi.advanceTimersByTime(500));

        expect(screen.getByRole("group", { name: "ROOM filter details" })).toBeInTheDocument();

        fireEvent.mouseLeave(screen.getByRole("group", { name: "ROOM filter details" }));
        act(() => vi.advanceTimersByTime(500));

        expect(
            screen.queryByRole("group", { name: "ROOM filter details" })
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByTitle("ROOM: Fursuit Lounge"));
        fireEvent.mouseLeave(screen.getByRole("group", { name: "ROOM filter details" }));
        act(() => vi.advanceTimersByTime(500));

        expect(
            screen.queryByRole("group", { name: "ROOM filter details" })
        ).not.toBeInTheDocument();
        expect(screen.getByTitle("ROOM: Fursuit Lounge")).toBeInTheDocument();
    });

    it("should properly handle pagination and change the page size", async () => {
        const user = userEvent.setup();
        mockedUseSchedule.mockReturnValue({
            data: largeScheduleData,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useSchedule>);

        renderPage();

        expect(screen.getAllByText("Page 1 / 2")).toHaveLength(2);
        expect(screen.getByText("Pagination event 1")).toBeInTheDocument();
        expect(screen.queryByText("Pagination event 11")).not.toBeInTheDocument();

        const scheduleContent = screen.getByTestId("schedule-content");
        scheduleContent.scrollTop = 120;
        await user.click(screen.getByRole("button", { name: "Next page (bottom)" }));
        expect(scheduleContent.scrollTop).toBe(0);
        expect(screen.getAllByText("Page 2 / 2")).toHaveLength(2);
        expect(screen.getByText("Pagination event 11")).toBeInTheDocument();

        await user.selectOptions(screen.getByRole("combobox", { name: "Page size (top)" }), "5");
        expect(screen.getAllByText("Page 1 / 3")).toHaveLength(2);
        expect(screen.getByText("Pagination event 1")).toBeInTheDocument();
    });

    it("should switch to a day grid view", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", { name: "Calendar" }));

        expect(screen.getByRole("tab", { name: /Thursday,\s+Aug\s+20/ })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /Friday,\s+Aug\s+21/ })).toBeInTheDocument();
        expect(
            screen.queryByRole("navigation", { name: "Schedule pagination (top)" })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("navigation", { name: "Schedule pagination (bottom)" })
        ).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Opening Ceremony/ })).toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: /Friday,\s+Aug\s+21/ }));

        expect(screen.getByRole("link", { name: /Fursuit Lounge - Fri/ })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /Opening Ceremony/ })).not.toBeInTheDocument();
    });

    it("should select the date-filtered day when entering the day grid", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(pageElements.dateFilter, "2026-08-20");
        await user.click(screen.getByRole("button", { name: "Calendar" }));

        const selectedDay = screen.getByRole("tab", { name: /Thursday,\s+Aug\s+20/ });
        const otherDay = screen.getByRole("tab", { name: /Friday,\s+Aug\s+21/ });

        expect(selectedDay).toHaveAttribute("aria-selected", "true");
        expect(otherDay).not.toBeDisabled();
        expect(screen.getByRole("link", { name: /Opening Ceremony/ })).toBeInTheDocument();

        await user.click(otherDay);

        expect(pageElements.dateFilter).toHaveValue("2026-08-21");
        expect(otherDay).toHaveAttribute("aria-selected", "true");
        expect(screen.getByRole("link", { name: /Fursuit Lounge - Fri/ })).toBeInTheDocument();
    });

    it("should keep unmatched calendar days visible but disabled", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(pageElements.roomFilter, "Fursuit Lounge");
        await user.click(screen.getByRole("button", { name: "Calendar" }));

        const unmatchedDay = screen.getByRole("tab", { name: /Thursday,\s+Aug\s+20/ });
        const matchingDay = screen.getByRole("tab", { name: /Friday,\s+Aug\s+21/ });

        expect(unmatchedDay).toBeInTheDocument();
        expect(unmatchedDay).toBeDisabled();
        expect(matchingDay).not.toBeDisabled();
        expect(matchingDay).toHaveAttribute("aria-selected", "true");
    });

    it("should share filters and mode position through query params", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(pageElements.roomFilter, "Fursuit Lounge");
        let params = new URLSearchParams(window.location.search);
        expect(params.get("room")).toBe("Fursuit Lounge");
        expect(params.get("page")).toBe("1");

        await user.click(screen.getByRole("button", { name: "Calendar" }));
        params = new URLSearchParams(window.location.search);
        expect(params.get("room")).toBe("Fursuit Lounge");
        expect(params.get("day")).toBe("2026-08-21");
        expect(params.has("page")).toBe(false);

        await user.click(screen.getByRole("button", { name: "List" }));
        params = new URLSearchParams(window.location.search);
        expect(params.has("day")).toBe(false);
        expect(params.get("page")).toBe("1");
    });

    it("should persist the selected view locally", async () => {
        const user = userEvent.setup();

        const firstRender = renderPage();
        await user.click(screen.getByRole("button", { name: "Calendar" }));
        firstRender.unmount();
        renderPage();

        expect(screen.getByRole("button", { name: "Calendar" })).toHaveAttribute(
            "aria-pressed",
            "true"
        );
    });

    it("should restore calendar view and selected day from a direct URL", async () => {
        window.localStorage.setItem("con-schedule:EF30:view", JSON.stringify("list"));
        window.history.replaceState({}, "", "/?day=2026-08-21");

        renderPage();

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Calendar" })).toHaveAttribute(
                "aria-pressed",
                "true"
            );
            expect(screen.getByRole("tab", { name: /Friday,\s+Aug\s+21/ })).toHaveAttribute(
                "aria-selected",
                "true"
            );
        });
    });

    it("should preserve direct day URL while schedule data is loading", async () => {
        const schedule = renderPage();

        mockedUseSchedule.mockReturnValueOnce({
            data: undefined,
            isLoading: true,
            isError: false,
        } as ReturnType<typeof useSchedule>);
        window.history.replaceState({}, "", "/?day=2026-08-21");
        schedule.rerender(
            <BrowserRouter>
                <SchedulePage />
            </BrowserRouter>
        );

        expect(window.location.search).toBe("?day=2026-08-21");
    });

    it("should filter event fields and can reset the search", async () => {
        vi.useFakeTimers();
        renderPage();

        const searchInput = pageElements.searchInput;
        act(() => fireEvent.change(searchInput, { target: { value: "PBUNHA" } }));
        act(() => vi.advanceTimersByTime(128));
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();
        expect(screen.queryByText("Opening Ceremony")).not.toBeInTheDocument();

        act(() => fireEvent.click(pageElements.clearFiltersButton));
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();
    });

    it("should show the loading state", () => {
        mockedUseSchedule.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as ReturnType<typeof useSchedule>);

        renderPage();

        expect(screen.getByText("Loading schedule...")).toBeInTheDocument();
    });

    it("should show the unavailable state when data is missing", () => {
        mockedUseSchedule.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as ReturnType<typeof useSchedule>);

        renderPage();

        expect(screen.getByText("No schedule data available.")).toBeInTheDocument();
    });

    it("should show the empty state when there are no events", () => {
        mockedUseSchedule.mockReturnValue({
            data: buildScheduleData({ ...SCHEDULE_MOCK_DATA, days: [] }),
            isLoading: false,
        } as ReturnType<typeof useSchedule>);

        renderPage();

        expect(screen.getByText("No events found.")).toBeInTheDocument();
    });

    it("should show the error banner and no-match state on schedule error", () => {
        vi.useFakeTimers();
        mockedUseSchedule.mockReturnValue({
            data: scheduleData,
            isLoading: false,
            isError: true,
        } as ReturnType<typeof useSchedule>);

        renderPage();

        expect(screen.getByText("Error occured, showing mock data.")).toBeInTheDocument();
        act(() => fireEvent.change(pageElements.searchInput, { target: { value: "not-found" } }));
        act(() => vi.advanceTimersByTime(128));

        expect(screen.getByText("No events match current filters.")).toBeInTheDocument();
    });

    it("should debounce search filtering while updating the input immediately", async () => {
        vi.useFakeTimers();
        renderPage();

        const searchInput = pageElements.searchInput;
        act(() => fireEvent.change(searchInput, { target: { value: "PBUNHA" } }));
        expect(searchInput).toHaveValue("PBUNHA");
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();

        act(() => vi.advanceTimersByTime(100));
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();

        act(() => vi.advanceTimersByTime(100));
        expect(screen.queryByText("Opening Ceremony")).not.toBeInTheDocument();
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();
    });
});
