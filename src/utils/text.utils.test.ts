import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { normalizeText, renderEventHtml } from "./text.utils";

describe("Utils / normalizeText", () => {
    it("should trim whitespace and converts text to lowercase", () => {
        expect(normalizeText("  Opening CEREMONY  ")).toBe("opening ceremony");
    });

    it("should return an empty string for whitespace-only input", () => {
        expect(normalizeText(" \t\n ")).toBe("");
    });

    it("should preserve whitespace inside the text", () => {
        expect(normalizeText("  Two  words  ")).toBe("two  words");
    });
});

describe("Utils / renderEventHtml", () => {
    it("should normalize Markdown-shaped URLs inside HTML links", () => {
        render(
            createElement(
                "div",
                null,
                renderEventHtml(
                    '<p>Contact <a href="[url](https://t.me/summerboatinfo)">@summerboatinfo</a></p>'
                )
            )
        );

        expect(screen.getByRole("link", { name: "@summerboatinfo" })).toHaveAttribute(
            "href",
            "https://t.me/summerboatinfo"
        );
    });

    it("should remove unsafe link protocols during sanitization", () => {
        const { container } = render(
            createElement(
                "div",
                null,
                renderEventHtml('<a href="javascript:alert(1)">Unsafe link</a>')
            )
        );

        expect(container.querySelector("a")).not.toHaveAttribute("href");
        expect(container).toHaveTextContent("Unsafe link");
    });
});
