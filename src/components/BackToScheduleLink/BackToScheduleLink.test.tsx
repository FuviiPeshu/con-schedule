import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BackToScheduleLinkComponent } from "./BackToScheduleLink.component";

const pageElements = {
    get backToScheduleLink() {
        return screen.getByRole("link", { name: "Back to schedule" });
    },
};

const renderLink = (entry: { pathname: string; search: string; state?: unknown }) =>
    render(
        <MemoryRouter initialEntries={[entry]}>
            <BackToScheduleLinkComponent fallbackSearch="?pageMock=1" />
        </MemoryRouter>
    );

describe("Components / BackToScheduleLink", () => {
    it("should return to the exact schedule position when opened from the schedule", () => {
        renderLink({
            pathname: "/event/621",
            search: "?room=Auditorium&date=2026-08-20",
            state: { fromSchedule: true },
        });

        expect(pageElements.backToScheduleLink).toHaveAttribute(
            "href",
            "/?room=Auditorium&date=2026-08-20"
        );
    });

    it("should use the fallback query when the page was opened directly", () => {
        renderLink({ pathname: "/event/621", search: "?room=Auditorium&page=2" });

        expect(pageElements.backToScheduleLink).toHaveAttribute("href", "/?pageMock=1");
    });
});
