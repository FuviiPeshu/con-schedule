import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SCHEDULE_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import { buildScheduleData } from "../../api";
import { useSchedule } from "../../hooks/useSchedule";
import { SchedulePage } from "./SchedulePage.component";

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

    it("should filter events by room and date", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Filter by room" }),
            "Fursuit Lounge"
        );
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();
        expect(screen.queryByText("Opening Ceremony")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Clear filters" }));
        await user.selectOptions(
            screen.getByRole("combobox", { name: "Filter by date" }),
            "2026-08-20"
        );
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.queryByText("Fursuit Lounge - Fri")).not.toBeInTheDocument();
    });

    it("should filter events by tag and speaker", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Filter by tag" }),
            "Information"
        );
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.queryByText("Fursuit Lounge - Fri")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Clear filters" }));
        await user.selectOptions(
            screen.getByRole("combobox", { name: "Filter by speaker" }),
            "SPEAK2"
        );
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.queryByText("Fursuit Lounge - Fri")).not.toBeInTheDocument();
    });

    it("should filter event fields and can reset the search", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.type(screen.getByRole("searchbox", { name: "Search events" }), "PBUNHA");
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();
        expect(screen.queryByText("Opening Ceremony")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Clear filters" }));
        expect(screen.getByText("Opening Ceremony")).toBeInTheDocument();
        expect(screen.getByText("Fursuit Lounge - Fri")).toBeInTheDocument();
    });
});
