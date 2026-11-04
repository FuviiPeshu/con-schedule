import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SelectComponent } from "./Select.component";

const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
];

const pageElements = {
    get select() {
        return screen.getByRole("combobox", { name: "Letter" });
    },
};

describe("Components / Select", () => {
    it("should render the options and the selected value", () => {
        render(
            <SelectComponent aria-label="Letter" options={options} value="b" onChange={vi.fn()} />
        );

        expect(pageElements.select).toHaveValue("b");
        expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
    });

    it("should add an empty option when an empty label is given", () => {
        render(
            <SelectComponent
                aria-label="Letter"
                options={options}
                value=""
                emptyLabel="All letters"
                onChange={vi.fn()}
            />
        );

        expect(screen.getByRole("option", { name: "All letters" })).toHaveValue("");
    });

    it("should report the chosen value", () => {
        const onChange = vi.fn();
        render(
            <SelectComponent aria-label="Letter" options={options} value="a" onChange={onChange} />
        );

        fireEvent.change(pageElements.select, { target: { value: "b" } });

        expect(onChange).toHaveBeenCalledWith("b");
    });
});
