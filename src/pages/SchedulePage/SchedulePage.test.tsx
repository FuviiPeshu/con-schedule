import { BrowserRouter } from "react-router-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
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

    const scheduleData = buildScheduleData(SCHEDULE_MOCK_DATA);
    const mockedUseSchedule = vi.mocked(useSchedule);

    const renderPage = () =>
        render(
            <BrowserRouter>
                <SchedulePage />
            </BrowserRouter>
        );

    beforeEach(() => {
        mockedUseSchedule.mockReturnValue({
            data: scheduleData,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useSchedule>);
    });

    afterEach(() => {
        vi.useRealTimers();
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

        expect(screen.getByText("Showing mock data.")).toBeInTheDocument();
        act(() => fireEvent.change(pageElements.searchInput, { target: { value: "not-found" } }));
        act(() => vi.advanceTimersByTime(128));

        expect(screen.getByText("No events match the current filters.")).toBeInTheDocument();
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
