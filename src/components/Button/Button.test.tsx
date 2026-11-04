import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ButtonComponent } from "./Button.component";

const pageElements = {
    get button() {
        return screen.getByRole("button", { name: "Clear" });
    },
};

describe("Components / Button", () => {
    it("should report clicks", () => {
        const onClick = vi.fn();
        render(
            <ButtonComponent variant="primary" onClick={onClick}>
                Clear
            </ButtonComponent>
        );

        fireEvent.click(pageElements.button);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should not report clicks when disabled", () => {
        const onClick = vi.fn();
        render(
            <ButtonComponent variant="primary" disabled onClick={onClick}>
                Clear
            </ButtonComponent>
        );

        fireEvent.click(pageElements.button);

        expect(pageElements.button).toBeDisabled();
        expect(onClick).not.toHaveBeenCalled();
    });

    it("should handle secondary variant and large size", () => {
        render(
            <ButtonComponent variant="secondary" size="l">
                Clear
            </ButtonComponent>
        );

        expect(pageElements.button).toHaveStyle({ minWidth: "40px", minHeight: "40px" });
    });
});
