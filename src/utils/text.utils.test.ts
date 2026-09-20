import { describe, expect, it } from "vitest";

import { normalizeText } from "./text.utils";

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
