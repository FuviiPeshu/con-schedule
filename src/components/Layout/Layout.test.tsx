import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { conName } from "../../configuration";
import { LayoutComponent } from "./Layout.component";

describe("Components / Layout", () => {
    it("should render customized header and page content", () => {
        render(
            <LayoutComponent>
                <p>Page content</p>
            </LayoutComponent>
        );

        expect(screen.getByRole("banner")).toHaveTextContent(conName);
        expect(screen.getByRole("main")).toHaveTextContent("Page content");
    });
});
