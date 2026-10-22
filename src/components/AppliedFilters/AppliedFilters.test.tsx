import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { emptyFilters } from "../../utils/scheduleFilters.utils";
import { AppliedFiltersComponent } from "./AppliedFilters.component";

const filters = { ...emptyFilters, room: "Fursuit Lounge", date: "2026-08-20" };

const pageElements = {
    get removeRoomButton() {
        return screen.getByRole("button", { name: "Remove room filter" });
    },
    get roomDetails() {
        return screen.getByRole("group", { name: "ROOM filter details" });
    },
    get roomDetailsIfPresent() {
        return screen.queryByRole("group", { name: "ROOM filter details" });
    },
    get clearAllButton() {
        return screen.getByRole("button", { name: "Clear all filters" });
    },
};

describe("Components / AppliedFilters", () => {
    describe("full layout", () => {
        it("should say when no filter is applied", () => {
            render(<AppliedFiltersComponent filters={emptyFilters} onRemove={vi.fn()} />);

            expect(screen.getByText("// NO FILTERS APPLIED")).toBeInTheDocument();
        });

        it("should list applied filters and remove one by key", () => {
            const onRemove = vi.fn();
            render(<AppliedFiltersComponent filters={filters} onRemove={onRemove} />);

            expect(screen.getByTitle("ROOM: Fursuit Lounge")).toBeInTheDocument();
            expect(screen.getByTitle("DATE: 2026-08-20")).toBeInTheDocument();

            fireEvent.click(pageElements.removeRoomButton);

            expect(onRemove).toHaveBeenCalledWith("room");
        });
    });

    describe("compact layout", () => {
        it("should render nothing without applied filters", () => {
            const { container } = render(
                <AppliedFiltersComponent filters={emptyFilters} onRemove={vi.fn()} compact />
            );

            expect(container).toBeEmptyDOMElement();
        });

        it("should expand a chip to show its value and allow removing it", () => {
            const onRemove = vi.fn();
            render(<AppliedFiltersComponent filters={filters} onRemove={onRemove} compact />);

            expect(screen.getByText("Filters (2)")).toBeInTheDocument();

            fireEvent.click(screen.getByTitle("ROOM: Fursuit Lounge"));
            const details = pageElements.roomDetails;
            expect(details).toHaveTextContent("Fursuit Lounge");

            fireEvent.click(pageElements.removeRoomButton);

            expect(onRemove).toHaveBeenCalledWith("room");
            expect(pageElements.roomDetailsIfPresent).not.toBeInTheDocument();
        });

        it("should clear all filters from the compact bar", () => {
            const onClear = vi.fn();
            render(
                <AppliedFiltersComponent
                    filters={filters}
                    onRemove={vi.fn()}
                    onClear={onClear}
                    compact
                />
            );

            fireEvent.click(pageElements.clearAllButton);

            expect(onClear).toHaveBeenCalledOnce();
        });
    });
});
