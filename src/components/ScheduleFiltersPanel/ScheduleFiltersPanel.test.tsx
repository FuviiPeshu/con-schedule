import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListDisplayMode, ScheduleView, type FilterOptions } from "../../schedule.types";
import { emptyFilters } from "../../utils/scheduleFilters.utils";
import { ScheduleFiltersPanel } from "./ScheduleFiltersPanel.component";

const filterOptions: FilterOptions = {
    room: [{ value: "Auditorium", label: "Auditorium" }],
    date: [{ value: "2026-08-20", label: "2026-08-20" }],
    tag: [{ value: "Information", label: "Information" }],
    speaker: [{ value: "SPEAK1", label: "Conops" }],
};

const pageElements = {
    get roomFilter() {
        return screen.getByRole("combobox", { name: "Filter by room" });
    },
    get speakerFilter() {
        return screen.getByRole("combobox", { name: "Filter by speaker" });
    },
    get roomFilterIfPresent() {
        return screen.queryByRole("combobox", { name: "Filter by room" });
    },
    get searchInput() {
        return screen.getByRole("searchbox", { name: "Search events" });
    },
    get clearFiltersButton() {
        return screen.getByRole("button", { name: "Clear filters" });
    },
    get removeRoomButton() {
        return screen.getByRole("button", { name: "Remove room filter" });
    },
    get expandFiltersButton() {
        return screen.getByRole("button", { name: "Expand filters" });
    },
};

const setup = (props: Partial<Parameters<typeof ScheduleFiltersPanel>[0]> = {}) => {
    const handlers = {
        onToggle: vi.fn(),
        onFilterChange: vi.fn(),
        onClear: vi.fn(),
        onViewChange: vi.fn(),
        onListDisplayModeChange: vi.fn(),
    };

    render(
        <ScheduleFiltersPanel
            filters={emptyFilters}
            filterOptions={filterOptions}
            filtersOpen
            hasActiveFilters={false}
            view={ScheduleView.List}
            listDisplayMode={ListDisplayMode.Full}
            {...handlers}
            {...props}
        />
    );

    return handlers;
};

describe("Components / ScheduleFiltersPanel", () => {
    it("should place view controls between the panel title and search", () => {
        setup();

        const title = screen.getByRole("heading", { name: "Control panel" });
        const listViewButton = screen.getByRole("button", { name: "List" });
        const searchInput = pageElements.searchInput;

        expect(title.compareDocumentPosition(listViewButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(listViewButton.compareDocumentPosition(searchInput)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING
        );
    });

    it("should report picked value for each select filter", () => {
        const { onFilterChange } = setup();

        fireEvent.change(pageElements.roomFilter, {
            target: { value: "Auditorium" },
        });
        fireEvent.change(pageElements.speakerFilter, {
            target: { value: "SPEAK1" },
        });

        expect(onFilterChange).toHaveBeenCalledWith("room", "Auditorium");
        expect(onFilterChange).toHaveBeenCalledWith("speaker", "SPEAK1");
    });

    it("should report search text", () => {
        const { onFilterChange } = setup();

        fireEvent.change(pageElements.searchInput, {
            target: { value: "fursuit" },
        });

        expect(onFilterChange).toHaveBeenCalledWith("search", "fursuit");
    });

    it("should only allow clearing when a filter is active", () => {
        const { onClear } = setup({ hasActiveFilters: false });

        expect(pageElements.clearFiltersButton).toBeDisabled();
        expect(onClear).not.toHaveBeenCalled();
    });

    it("should clear all filters", () => {
        const { onClear, onFilterChange } = setup({
            filters: { ...emptyFilters, room: "Auditorium" },
            hasActiveFilters: true,
        });

        fireEvent.click(pageElements.clearFiltersButton);
        fireEvent.click(pageElements.removeRoomButton);

        expect(onClear).toHaveBeenCalledOnce();
        expect(onFilterChange).toHaveBeenCalledWith("room", "");
    });

    it("should collapse to compact bar", () => {
        const { onToggle } = setup({
            filtersOpen: false,
            filters: { ...emptyFilters, room: "Auditorium" },
            hasActiveFilters: true,
        });

        expect(pageElements.roomFilterIfPresent).not.toBeInTheDocument();
        expect(screen.getByTitle("ROOM: Auditorium")).toBeInTheDocument();

        fireEvent.click(pageElements.expandFiltersButton);

        expect(onToggle).toHaveBeenCalledOnce();
    });
});
