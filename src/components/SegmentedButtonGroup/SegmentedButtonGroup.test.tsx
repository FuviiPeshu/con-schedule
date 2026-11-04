import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SegmentedButtonGroupComponent } from "./SegmentedButtonGroup.component";

const options = [
    { value: "one", label: "One" },
    { value: "two", label: "Two" },
] as const;

const pageElements = {
    get group() {
        return screen.getByRole("group", { name: "Numbers" });
    },
    get oneButton() {
        return screen.getByRole("button", { name: "One" });
    },
    get twoButton() {
        return screen.getByRole("button", { name: "Two" });
    },
};

describe("Components / SegmentedButtonGroup", () => {
    it("should mark only active option as 'pressed'", () => {
        render(
            <SegmentedButtonGroupComponent
                aria-label="Numbers"
                options={options}
                value="one"
                onChange={vi.fn()}
            />
        );

        expect(pageElements.group).toBeInTheDocument();
        expect(pageElements.oneButton).toHaveAttribute("aria-pressed", "true");
        expect(pageElements.twoButton).toHaveAttribute("aria-pressed", "false");
    });

    it("should trigger onChange with selected option", () => {
        const onChange = vi.fn();
        render(
            <SegmentedButtonGroupComponent
                aria-label="Numbers"
                options={options}
                value="one"
                onChange={onChange}
            />
        );

        fireEvent.click(pageElements.twoButton);

        expect(onChange).toHaveBeenCalledWith("two");
    });
});
