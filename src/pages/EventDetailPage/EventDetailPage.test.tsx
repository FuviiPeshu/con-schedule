import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SCHEDULE_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import { buildScheduleData } from "../../api";
import { useSchedule } from "../../hooks/useSchedule";
import { EventDetailPage } from "./EventDetailPage.component";

describe("Pages / EventDetailPage", () => {
    vi.mock("../../hooks/useSchedule", () => ({
        useSchedule: vi.fn(),
    }));

    const mockedUseSchedule = vi.mocked(useSchedule);
    const scheduleData = buildScheduleData(SCHEDULE_MOCK_DATA);

    const renderPage = (eventId: string) =>
        render(
            <MemoryRouter initialEntries={[`/event/${eventId}`]}>
                <Routes>
                    <Route path="/event/:eventId" element={<EventDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

    beforeEach(() => {
        mockedUseSchedule.mockReset();
    });

    it("should render loading state while the schedule is loading", () => {
        mockedUseSchedule.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as ReturnType<typeof useSchedule>);

        renderPage("621");

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render the selected event as JSON when loaded", () => {
        mockedUseSchedule.mockReturnValue({
            data: scheduleData,
            isLoading: false,
        } as ReturnType<typeof useSchedule>);

        renderPage("621");

        expect(screen.getByText(/Opening Ceremony/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Back to schedule" })).toHaveAttribute("href", "/");
    });

    it("should show event not found text when the event does not exist", () => {
        mockedUseSchedule.mockReturnValue({
            data: scheduleData,
            isLoading: false,
        } as ReturnType<typeof useSchedule>);

        renderPage("999999");

        expect(screen.getByText("Event not found.")).toBeInTheDocument();
    });
});
