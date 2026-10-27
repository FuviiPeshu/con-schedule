import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { FilterOptions } from "../../schedule.types";
import { emptyFilters } from "../../utils/scheduleFilters.utils";
import { AppliedFiltersComponent } from "./AppliedFilters.component";

const filters = { ...emptyFilters, room: "Fursuit Lounge", date: "2026-08-20" };
const speakerFilters = { ...emptyFilters, speaker: "SPEAK1" };
const filterOptions: FilterOptions = {
    room: [{ value: "Fursuit Lounge", label: "Fursuit Lounge" }],
    date: [{ value: "2026-08-20", label: "2026-08-20" }],
    tag: [],
    speaker: [{ value: "SPEAK1", label: "Conops" }],
};

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
            render(
                <AppliedFiltersComponent
                    filters={emptyFilters}
                    filterOptions={filterOptions}
                    onRemove={vi.fn()}
                />
            );

            expect(screen.getByText("// NO FILTERS APPLIED")).toBeInTheDocument();
        });

        it("should list applied filters and remove one by key", () => {
            const onRemove = vi.fn();
            render(
                <AppliedFiltersComponent
                    filters={filters}
                    filterOptions={filterOptions}
                    onRemove={onRemove}
                />
            );

            expect(screen.getByTitle("ROOM: Fursuit Lounge")).toBeInTheDocument();
            expect(screen.getByTitle("DATE: 2026-08-20")).toBeInTheDocument();

            fireEvent.click(pageElements.removeRoomButton);

            expect(onRemove).toHaveBeenCalledWith("room");
        });

        it("should show the speaker name instead of its filter code", () => {
            render(
                <AppliedFiltersComponent
                    filters={speakerFilters}
                    filterOptions={filterOptions}
                    onRemove={vi.fn()}
                />
            );

            expect(screen.getByTitle("SPEAKER: Conops")).toBeInTheDocument();
            expect(screen.getByText("Conops")).toBeInTheDocument();
            expect(screen.queryByText("SPEAK1")).not.toBeInTheDocument();
        });
    });

    describe("compact layout", () => {
        it("should render nothing without applied filters", () => {
            const { container } = render(
                <AppliedFiltersComponent
                    filters={emptyFilters}
                    filterOptions={filterOptions}
                    onRemove={vi.fn()}
                    compact
                />
            );

            expect(container).toBeEmptyDOMElement();
        });

        it("should expand a chip to show its value and allow removing it", () => {
            const onRemove = vi.fn();
            render(
                <AppliedFiltersComponent
                    filters={filters}
                    filterOptions={filterOptions}
                    onRemove={onRemove}
                    compact
                />
            );

            expect(screen.getByText("Filters (2)")).toBeInTheDocument();

            fireEvent.click(screen.getByTitle("ROOM: Fursuit Lounge"));
            const details = pageElements.roomDetails;
            expect(details).toHaveTextContent("Fursuit Lounge");

            fireEvent.click(pageElements.removeRoomButton);

            expect(onRemove).toHaveBeenCalledWith("room");
            expect(pageElements.roomDetailsIfPresent).not.toBeInTheDocument();
        });

        it("should show the speaker name when expanding a compact filter", () => {
            render(
                <AppliedFiltersComponent
                    filters={speakerFilters}
                    filterOptions={filterOptions}
                    onRemove={vi.fn()}
                    compact
                />
            );

            fireEvent.click(screen.getByTitle("SPEAKER: Conops"));

            expect(screen.getByRole("group", { name: "SPEAKER filter details" })).toHaveTextContent(
                "Conops"
            );
            expect(screen.queryByText("SPEAK1")).not.toBeInTheDocument();
        });

        it("should clear all filters from the compact bar", () => {
            const onClear = vi.fn();
            render(
                <AppliedFiltersComponent
                    filters={filters}
                    filterOptions={filterOptions}
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
