import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PagePickerComponent } from "./PagePicker.component";

const renderPicker = (overrides: Partial<Parameters<typeof PagePickerComponent>[0]> = {}) => {
    const onPageChange = vi.fn();

    render(
        <PagePickerComponent
            currentPage={2}
            totalPages={12}
            statusText="Page 02 / 12"
            position="top"
            onPageChange={onPageChange}
            {...overrides}
        />
    );

    return { onPageChange, user: userEvent.setup() };
};

const pageElements = {
    get trigger() {
        return screen.getByRole("button", { name: "Select page (top)" });
    },
    get search() {
        return screen.getByRole("searchbox", { name: "Search page" });
    },
};

describe("Components / PagePicker", () => {
    it("should render plain status when there is just a single page", () => {
        renderPicker({ totalPages: 1, currentPage: 1, statusText: "Page 1 / 1" });

        expect(screen.getByText("Page 1 / 1")).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should list all pages and mark the current one", async () => {
        const { user } = renderPicker();

        await user.click(pageElements.trigger);

        expect(screen.getAllByRole("button", { name: /^Page \d+$/ })).toHaveLength(12);
        expect(screen.getByRole("button", { name: "Page 02" })).toHaveAttribute(
            "aria-current",
            "page"
        );
        expect(pageElements.search).toHaveFocus();
    });

    it("should jump to page picked from the list", async () => {
        const { user, onPageChange } = renderPicker();

        await user.click(pageElements.trigger);
        await user.click(screen.getByRole("button", { name: "Page 09" }));

        expect(onPageChange).toHaveBeenCalledWith(9);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should jump to the exact page typed and submitted", async () => {
        const { user, onPageChange } = renderPicker();

        await user.click(pageElements.trigger);
        await user.type(pageElements.search, "1{Enter}");

        expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it("should filter pages while typing and ignore out-of-range submissions", async () => {
        const { user, onPageChange } = renderPicker();

        await user.click(pageElements.trigger);
        await user.type(pageElements.search, "99");

        expect(screen.getByText("No matching pages.")).toBeInTheDocument();

        await user.keyboard("{Enter}");

        expect(onPageChange).not.toHaveBeenCalled();
    });

    it("should search by page labels when provided", async () => {
        const labels = Array.from({ length: 12 }, (_, index) =>
            index === 4 ? "Saturday" : `Day ${index + 1}`
        );
        const { user, onPageChange } = renderPicker({ pageLabels: labels });

        await user.click(pageElements.trigger);
        await user.type(pageElements.search, "satur{Enter}");

        expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it("should not report the current page again", async () => {
        const { user, onPageChange } = renderPicker();

        await user.click(pageElements.trigger);
        await user.click(screen.getByRole("button", { name: "Page 02" }));

        expect(onPageChange).not.toHaveBeenCalled();
    });
});
