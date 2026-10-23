import { BrowserRouter } from "react-router-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SCHEDULE_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import { buildScheduleData } from "../../api";
import { useSchedule } from "../../hooks/useSchedule";
import { SchedulePage } from "./SchedulePage.component";

vi.mock("../../hooks/useSchedule", () => ({
    useSchedule: vi.fn(),
}));

const pageElements = {
    get roomFilter() {
        return screen.getByRole("combobox", { name: "Filter by room" });
    },
    get dateFilter() {
        return screen.getByRole("combobox", { name: "Filter by date" });
    },
    get searchInput() {
        return screen.getByRole("searchbox", { name: "Search events" });
    },
    get clearFiltersButton() {
        return screen.getByRole("button", { name: "Clear filters" });
    },
};

describe("Pages / SchedulePage", () => {
    const mockedUseSchedule = vi.mocked(useSchedule);
    const scheduleData = buildScheduleData(SCHEDULE_MOCK_DATA);

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

    it("should filter the list when a filter is picked and restore it when cleared", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(pageElements.roomFilter, "Fursuit Lounge");
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();
        expect(screen.queryByText("Opening Ceremony")).not.toBeInTheDocument();

        await user.click(pageElements.clearFiltersButton);
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();
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

    it("should select date-filtered day when entering the day grid", async () => {
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
        expect(params.get("date")).toBe("2026-08-21");
        expect(params.has("page")).toBe(false);

        await user.click(screen.getByRole("button", { name: "List" }));
        params = new URLSearchParams(window.location.search);
        expect(params.has("date")).toBe(false);
        expect(params.get("page")).toBe("1");
    });

    it("should persist selected view locally", async () => {
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
        window.history.replaceState({}, "", "/?date=2026-08-21");

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
        window.history.replaceState({}, "", "/?date=2026-08-21");
        schedule.rerender(
            <BrowserRouter>
                <SchedulePage />
            </BrowserRouter>
        );

        expect(window.location.search).toBe("?date=2026-08-21");
    });

    it("should show after-midnight events on the convention day they belong to", () => {
        mockedUseSchedule.mockReturnValue({
            data: buildScheduleData({
                ...SCHEDULE_MOCK_DATA,
                days: [
                    {
                        ...SCHEDULE_MOCK_DATA.days[0],
                        slots: [
                            ...SCHEDULE_MOCK_DATA.days[0].slots,
                            {
                                ...SCHEDULE_MOCK_DATA.days[0].slots[0],
                                id: 1300,
                                title: "After-midnight event",
                                start: "2026-08-21T02:00:00+02:00",
                                end: "2026-08-21T03:00:00+02:00",
                                duration: 60,
                            },
                        ],
                    },
                    SCHEDULE_MOCK_DATA.days[1],
                ],
            }),
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useSchedule>);
        window.history.replaceState({}, "", "/?date=2026-08-20");

        renderPage();

        expect(screen.getByRole("link", { name: /After-midnight event/ })).toBeInTheDocument();
    });

    it("should show loading state", () => {
        mockedUseSchedule.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as ReturnType<typeof useSchedule>);

        renderPage();

        expect(screen.getByText("Loading schedule...")).toBeInTheDocument();
    });

    it("should show unavailable state when data is missing", () => {
        mockedUseSchedule.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as ReturnType<typeof useSchedule>);

        renderPage();

        expect(screen.getByText("No schedule data available.")).toBeInTheDocument();
    });

    it("should show error banner when the schedule failed to load", () => {
        mockedUseSchedule.mockReturnValue({
            data: scheduleData,
            isLoading: false,
            isError: true,
        } as ReturnType<typeof useSchedule>);

        renderPage();

        expect(screen.getByText("Error occured, showing mock data.")).toBeInTheDocument();
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
