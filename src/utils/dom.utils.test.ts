import { describe, expect, it } from "vitest";

import { containsNode, isNode } from "./dom.utils";

describe("Utils / DOM", () => {
    it("should identify element as a DOM node", () => {
        expect(isNode(document.createElement("div"))).toBe(true);
    });

    it("should identify document as a DOM node", () => {
        expect(isNode(document)).toBe(true);
    });

    it("should reject null and non-node event targets", () => {
        expect(isNode(null)).toBe(false);
        expect(isNode(window)).toBe(false);
    });

    it("should check whether a container contains an event target", () => {
        const container = document.createElement("div");
        const child = document.createElement("button");
        const sibling = document.createElement("span");

        container.append(child, sibling);

        expect(containsNode(container, child)).toBe(true);
        expect(containsNode(container, sibling)).toBe(true);
        expect(containsNode(child, container)).toBe(false);
    });

    it("should reject null and non-node containment targets", () => {
        const container = document.createElement("div");

        expect(containsNode(container, null)).toBe(false);
        expect(containsNode(container, window)).toBe(false);
    });
});
