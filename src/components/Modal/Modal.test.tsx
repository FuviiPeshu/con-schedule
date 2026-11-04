import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ModalComponent } from "./Modal.component";

const pageElements = {
    get dialog() {
        return screen.getByRole("dialog", { name: "Preview" });
    },
    get closeButton() {
        return screen.getByRole("button", { name: "Close preview" });
    },
};

const setup = (open = true) => {
    const onClose = vi.fn();

    render(
        <ModalComponent open={open} onClose={onClose} label="Preview" closeLabel="Close preview">
            <p>Modal content</p>
        </ModalComponent>
    );

    return { onClose };
};

describe("Components / Modal", () => {
    it("should render content in a portal on the document body", () => {
        setup();

        expect(pageElements.dialog).toHaveAttribute("open");
        expect(pageElements.dialog.parentElement).toBe(document.body);
        expect(screen.getByText("Modal content")).toBeInTheDocument();
    });

    it("should not render content while closed", () => {
        setup(false);

        expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Close preview" })).not.toBeInTheDocument();
    });

    it("should request close from the close button, Escape and the backdrop", () => {
        const { onClose } = setup();

        fireEvent.click(pageElements.closeButton);
        fireEvent.keyDown(pageElements.dialog, { key: "Escape" });
        fireEvent.click(pageElements.dialog);

        expect(onClose).toHaveBeenCalledTimes(3);
    });

    it("should keep open when the content is clicked", () => {
        const { onClose } = setup();

        fireEvent.click(screen.getByText("Modal content"));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("should close the dialog and restore focus to the opener", () => {
        const Harness = () => {
            const [open, setOpen] = useState(false);

            return (
                <>
                    <button type="button" onClick={() => setOpen(true)}>
                        Open preview
                    </button>
                    <ModalComponent open={open} onClose={() => setOpen(false)} label="Preview">
                        <p>Modal content</p>
                    </ModalComponent>
                </>
            );
        };

        render(<Harness />);

        const opener = screen.getByRole("button", { name: "Open preview" });
        opener.focus();

        fireEvent.click(opener);
        const dialog = screen.getByRole("dialog", { name: "Preview" });
        expect(dialog).toHaveAttribute("open");

        fireEvent.keyDown(dialog, { key: "Escape" });

        expect(dialog).not.toHaveAttribute("open");
        expect(opener).toHaveFocus();
    });
});
