import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterInputComponent } from "./FilterInput.components";
import { FilterSelectComponent } from "./FilterSelect.components";

describe("Components / FilterInputComponent", () => {
    it("should render configured input and handle its value change", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <FilterInputComponent
                label="Search"
                placeholder="Search events"
                inputType="search"
                value=""
                onChange={onChange}
            />
        );

        const input = screen.getByRole("searchbox", { name: "Search events" });
        expect(input).toHaveAttribute("placeholder", "Search events");

        await user.type(input, "EF");

        expect(onChange).toHaveBeenNthCalledWith(1, "E");
        expect(onChange).toHaveBeenNthCalledWith(2, "F");
    });
});

describe("Components / FilterSelectComponent", () => {
    it("should render provided options and handle value selection", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <FilterSelectComponent
                label="Room"
                emptyLabel="All rooms"
                value="Auditorium"
                options={[
                    { value: "Auditorium", label: "Auditorium" },
                    { value: "Fursuit Lounge", label: "Fursuit Lounge" },
                ]}
                onChange={onChange}
            />
        );

        const select = screen.getByRole("combobox", { name: "Filter by room" });
        expect(select).toHaveValue("Auditorium");
        expect(screen.getByRole("option", { name: "All rooms" })).toBeInTheDocument();

        await user.selectOptions(select, "Fursuit Lounge");

        expect(onChange).toHaveBeenCalledWith("Fursuit Lounge");
    });
});
