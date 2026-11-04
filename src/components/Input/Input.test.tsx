import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InputComponent } from "./Input.component";

const pageElements = {
    get input() {
        return screen.getByRole("textbox", { name: "Search" });
    },
};

describe("Components / Input", () => {
    it("should show given value and have placeholder attribute", () => {
        render(
            <InputComponent
                aria-label="Search"
                placeholder="Type here"
                value="abc"
                onChange={vi.fn()}
            />
        );

        expect(pageElements.input).toHaveValue("abc");
        expect(pageElements.input).toHaveAttribute("placeholder", "Type here");
    });

    it("should trigger onChange with typed text", () => {
        const onChange = vi.fn();
        render(<InputComponent aria-label="Search" value="" onChange={onChange} />);

        fireEvent.change(pageElements.input, { target: { value: "robot" } });

        expect(onChange).toHaveBeenCalledWith("robot");
    });
});
