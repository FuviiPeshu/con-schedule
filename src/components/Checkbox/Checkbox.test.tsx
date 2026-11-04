import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CheckboxComponent } from "./Checkbox.component";

const pageElements = {
    get checkbox() {
        return screen.getByRole("checkbox", { name: "Compact view" });
    },
};

describe("Components / Checkbox", () => {
    it("should reflect the checked state", () => {
        render(<CheckboxComponent label="Compact view" checked onChange={vi.fn()} />);

        expect(pageElements.checkbox).toBeChecked();
    });

    it("should trigger change event", () => {
        const onChange = vi.fn();
        render(<CheckboxComponent label="Compact view" checked={false} onChange={onChange} />);

        fireEvent.click(pageElements.checkbox);

        expect(onChange).toHaveBeenCalledWith(true);
    });
});
