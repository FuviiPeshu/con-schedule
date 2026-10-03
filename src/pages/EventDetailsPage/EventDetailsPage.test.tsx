import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EXAMPLE_EVENT_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import { buildScheduleData } from "../../api";
import { useSchedule } from "../../hooks/useSchedule";
import { EventDetailsPage } from "./EventDetailsPage.component";

describe("Pages / EventDetailPage", () => {
    vi.mock("../../hooks/useSchedule", () => ({
        useSchedule: vi.fn(),
    }));

    it("should render an event dossier with schedule metadata", () => {
        vi.mocked(useSchedule).mockReturnValue({
            data: buildScheduleData({
                event: { name: "Eurofurence 30", slug: "eurofurence-30" },
                schedule_version: "0.1",
                tags: EXAMPLE_EVENT_MOCK_DATA.tags.map((tag) => ({ ...tag, color: "#42d4f4" })),
                tracks: [EXAMPLE_EVENT_MOCK_DATA.track],
                rooms: [{ id: 1, name: "Auditorium", position: 0 }],
                speakers: EXAMPLE_EVENT_MOCK_DATA.speakers.map((speaker) => ({
                    ...speaker,
                    biography: null,
                })),
                days: [{ date: "2026-08-20", label: "Thursday", slots: [EXAMPLE_EVENT_MOCK_DATA] }],
                imprint_url: "https://example.com/imprint",
                privacy_url: "https://example.com/privacy",
            }),
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useSchedule>);

        render(
            <MemoryRouter initialEntries={["/event/621?room=Auditorium&page=2"]}>
                <Routes>
                    <Route path="/event/:eventId" element={<EventDetailsPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByRole("heading", { name: EXAMPLE_EVENT_MOCK_DATA.title })
        ).toBeInTheDocument();
        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.room.name)).toBeInTheDocument();
        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.track.name)).toBeInTheDocument();
        expect(screen.getByText(EXAMPLE_EVENT_MOCK_DATA.tags[0].tag)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Back to schedule/i })).toHaveAttribute(
            "href",
            "/?page=1"
        );
    });

    it("should preserve schedule query state when entered from the schedule", () => {
        vi.mocked(useSchedule).mockReturnValue({
            data: buildScheduleData({
                event: { name: "Eurofurence 30", slug: "eurofurence-30" },
                schedule_version: "0.1",
                tags: EXAMPLE_EVENT_MOCK_DATA.tags.map((tag) => ({ ...tag, color: "#42d4f4" })),
                tracks: [EXAMPLE_EVENT_MOCK_DATA.track],
                rooms: [{ id: 1, name: "Auditorium", position: 0 }],
                speakers: [],
                days: [{ date: "2026-08-20", label: "Thursday", slots: [EXAMPLE_EVENT_MOCK_DATA] }],
                imprint_url: "https://example.com/imprint",
                privacy_url: "https://example.com/privacy",
            }),
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useSchedule>);

        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: "/event/621",
                        search: "?room=Auditorium&day=2026-08-20",
                        state: { fromSchedule: true },
                    },
                ]}
            >
                <Routes>
                    <Route path="/event/:eventId" element={<EventDetailsPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole("link", { name: /Back to schedule/i })).toHaveAttribute(
            "href",
            "/?room=Auditorium&day=2026-08-20"
        );
    });
});
