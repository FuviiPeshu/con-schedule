import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PopoverComponent } from "./Popover.component";

const Harness = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button type="button">Outside</button>
            <PopoverComponent
                open={open}
                onClose={() => setOpen(false)}
                label="Panel"
                trigger={
                    <button type="button" onClick={() => setOpen((current) => !current)}>
                        Toggle
                    </button>
                }
            >
                <input aria-label="Inner search" />
            </PopoverComponent>
        </>
    );
};

const pageElements = {
    get trigger() {
        return screen.getByRole("button", { name: "Toggle" });
    },
    get panel() {
        return screen.queryByRole("dialog", { name: "Panel" });
    },
};

describe("Components / Popover", () => {
    it("should open the panel and focus its input", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        expect(pageElements.panel).not.toBeInTheDocument();

        await user.click(pageElements.trigger);

        expect(pageElements.panel).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Inner search" })).toHaveFocus();
    });

    it("should close on Escape and return focus to the trigger", async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(pageElements.trigger);

        await user.keyboard("{Escape}");

        expect(pageElements.panel).not.toBeInTheDocument();
        expect(pageElements.trigger).toHaveFocus();
    });

    it("should close on outside click without stealing focus", async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(pageElements.trigger);

        await user.click(screen.getByRole("button", { name: "Outside" }));

        expect(pageElements.panel).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
    });
});
