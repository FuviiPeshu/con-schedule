import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { conName } from "../../configuration";
import { Layout } from "./Layout.component";

describe("Components / Layout", () => {
    it("should render customized header and page content", () => {
        render(
            <Layout>
                <p>Page content</p>
            </Layout>
        );

        expect(screen.getByRole("banner")).toHaveTextContent(conName);
        expect(screen.getByRole("main")).toHaveTextContent("Page content");
    });
});
