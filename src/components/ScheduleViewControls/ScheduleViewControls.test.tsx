import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListDisplayMode, ScheduleView } from "../../schedule.types";
import { ScheduleViewControlsComponent } from "./ScheduleViewControls.component";

const pageElements = {
    get listViewButton() {
        return screen.getByRole("button", { name: "List" });
    },
    get calendarViewButton() {
        return screen.getByRole("button", { name: "Calendar" });
    },
    get compactViewCheckbox() {
        return screen.getByRole("checkbox", { name: "Compact view" });
    },
    get compactViewCheckboxIfPresent() {
        return screen.queryByRole("checkbox", { name: "Compact view" });
    },
};

const setup = (view: ScheduleView, listDisplayMode: ListDisplayMode = ListDisplayMode.Full) => {
    const onViewChange = vi.fn();
    const onListDisplayModeChange = vi.fn();

    render(
        <ScheduleViewControlsComponent
            view={view}
            onViewChange={onViewChange}
            listDisplayMode={listDisplayMode}
            onListDisplayModeChange={onListDisplayModeChange}
        />
    );

    return { onViewChange, onListDisplayModeChange };
};

describe("Components / ScheduleViewControls", () => {
    it("should mark active view and request the other one", () => {
        const { onViewChange } = setup(ScheduleView.List);

        expect(pageElements.listViewButton).toHaveAttribute("aria-pressed", "true");
        expect(pageElements.calendarViewButton).toHaveAttribute("aria-pressed", "false");

        fireEvent.click(pageElements.calendarViewButton);

        expect(onViewChange).toHaveBeenCalledWith(ScheduleView.Calendar);
    });

    it("should offer compact option in the list and report its change", () => {
        const { onListDisplayModeChange } = setup(ScheduleView.List);

        fireEvent.click(pageElements.compactViewCheckbox);

        expect(onListDisplayModeChange).toHaveBeenCalledWith(ListDisplayMode.Compact);
    });

    it("should reflect compact mode and turn it off again", () => {
        const { onListDisplayModeChange } = setup(ScheduleView.List, ListDisplayMode.Compact);

        expect(pageElements.compactViewCheckbox).toBeChecked();

        fireEvent.click(pageElements.compactViewCheckbox);

        expect(onListDisplayModeChange).toHaveBeenCalledWith(ListDisplayMode.Full);
    });

    it("should hide compact option in the calendar view", () => {
        setup(ScheduleView.Calendar);

        expect(pageElements.compactViewCheckboxIfPresent).not.toBeInTheDocument();
    });
});
