import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NotFoundPage } from "./NotFoundPage.component";

describe("Pages / NotFoundPage", () => {
    it("should render heading and a link back to the schedule", () => {
        render(
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        );

        expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Back to schedule" })).toHaveAttribute("href", "/");
    });
});
