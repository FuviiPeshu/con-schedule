import { MemoryRouter, Route, Routes } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EXAMPLE_EVENT_MOCK_DATA } from "../../__mocks__/schedule.mocks";
import { buildScheduleData } from "../../api";
import { useSchedule } from "../../hooks/useSchedule";
import { EventDetailsPage } from "./EventDetailsPage.component";

vi.mock("../../hooks/useSchedule", () => ({
    useSchedule: vi.fn(),
}));

interface RenderEventParams {
    eventPatch?: Partial<typeof EXAMPLE_EVENT_MOCK_DATA>;
    path?: string;
}

describe("Pages / EventDetailsPage", () => {
    it("should render event dossier with schedule metadata", () => {
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
        expect(screen.getByRole("link", { name: /Back to schedule/i })).toBeInTheDocument();
    });

    describe("rendering edge cases", () => {
        const renderEvent = ({ eventPatch = {}, path = "/event/621" }: RenderEventParams = {}) => {
            vi.mocked(useSchedule).mockReturnValue({
                data: buildScheduleData({
                    event: { name: "Eurofurence 30", slug: "eurofurence-30" },
                    schedule_version: "0.1",
                    tags: [],
                    tracks: [EXAMPLE_EVENT_MOCK_DATA.track],
                    rooms: [{ id: 1, name: "Auditorium", position: 0 }],
                    speakers: [],
                    days: [
                        {
                            date: "2026-08-20",
                            label: "Thursday",
                            slots: [{ ...EXAMPLE_EVENT_MOCK_DATA, ...eventPatch }],
                        },
                    ],
                    imprint_url: "https://example.com/imprint",
                    privacy_url: "https://example.com/privacy",
                }),
                isLoading: false,
                isError: false,
            } as ReturnType<typeof useSchedule>);

            return render(
                <MemoryRouter initialEntries={[path]}>
                    <Routes>
                        <Route path="/event/:eventId" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            );
        };

        it("should open an event image in a full-screen dialog", async () => {
            const user = userEvent.setup();
            const imageUrl = "https://example.test/event.webp";
            renderEvent({ eventPatch: { image: imageUrl } });

            const image = screen.getByRole("button", {
                name: "Open full-screen image for Opening Ceremony",
            });
            await user.click(image);

            const dialog = screen.getByRole("dialog", { name: "Opening Ceremony image viewer" });
            expect(dialog).toHaveAttribute("open");
            expect(
                screen.getByRole("img", { name: "Opening Ceremony event image" })
            ).toHaveAttribute("src", imageUrl);
            const closeButton = screen.getByRole("button", { name: "Close image" });
            expect(closeButton).toHaveTextContent("x");
            expect(closeButton).toHaveStyle({
                position: "absolute",
                top: "16px",
                right: "16px",
                gridArea: "auto",
            });
            expect(dialog).toHaveStyle({ height: "100dvh", overflow: "hidden" });

            fireEvent.keyDown(dialog, { key: "Escape" });

            expect(dialog).not.toHaveAttribute("open");
            expect(image).toHaveFocus();
        });

        it("should activate the image viewer with the keyboard", async () => {
            const user = userEvent.setup();
            renderEvent({ eventPatch: { image: "https://example.test/event.webp" } });

            const imageButton = screen.getByRole("button", {
                name: "Open full-screen image for Opening Ceremony",
            });
            imageButton.focus();
            await user.keyboard("{Enter}");

            const dialog = screen.getByRole("dialog", { name: "Opening Ceremony image viewer" });
            expect(dialog).toHaveAttribute("open");

            fireEvent.keyDown(dialog, { key: "Escape" });

            expect(dialog).not.toHaveAttribute("open");
        });

        it("should use the side layout for a square image", () => {
            renderEvent({ eventPatch: { image: "https://example.test/event.webp" } });

            const imageButton = screen.getByRole("button", {
                name: "Open full-screen image for Opening Ceremony",
            });
            const image = imageButton.querySelector("img");

            if (!image) {
                throw new Error("Expected the image button to contain an image");
            }

            Object.defineProperty(image, "naturalWidth", { configurable: true, value: 500 });
            Object.defineProperty(image, "naturalHeight", { configurable: true, value: 500 });
            fireEvent.load(image);

            expect(imageButton).toHaveStyle({ width: "50%", minWidth: "50%" });
        });

        it("should not produce invalid DOM nesting from sanitized HTML content", () => {
            const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

            renderEvent();

            expect(consoleError).not.toHaveBeenCalled();
            consoleError.mockRestore();
        });

        it("should show placeholders for unscheduled events without tags or description", () => {
            renderEvent({
                eventPatch: {
                    start: null,
                    end: null,
                    duration: 0,
                    tags: [],
                    abstract: "",
                    description: "",
                },
            });

            expect(screen.getByText("Unscheduled")).toBeInTheDocument();
            expect(screen.getByText("Open window")).toBeInTheDocument();
            expect(screen.getAllByText("Unknown")).toHaveLength(2); // status pill and duration
            expect(screen.getByText("No tags assigned")).toBeInTheDocument();
            expect(screen.getByText("No event abstract available.")).toBeInTheDocument();
            expect(screen.getByText("No description available.")).toBeInTheDocument();
        });

        it("should explain when the event does not exist", () => {
            renderEvent({ path: "/event/999999" });

            expect(screen.getByText("Record unavailable")).toBeInTheDocument();
            expect(screen.getByText("Event not found...")).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /Back to schedule/i })).toBeInTheDocument();
        });
    });
});
