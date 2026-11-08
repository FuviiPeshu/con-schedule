import { afterEach, describe, expect, it } from "vitest";

import { syncTruncationTitle } from "./truncation.utils";

const createText = (overflowing: boolean, ellipsis = true) => {
    const element = document.createElement("span");
    element.textContent = " Long title ";
    if (ellipsis) {
        element.style.textOverflow = "ellipsis";
    }
    Object.defineProperty(element, "scrollWidth", {
        value: overflowing ? 200 : 100,
        configurable: true,
    });
    Object.defineProperty(element, "clientWidth", { value: 100 });
    document.body.append(element);

    return element;
};

describe("Utils / truncation", () => {
    afterEach(() => {
        document.body.replaceChildren();
    });

    it("should set full text as title on truncated element", () => {
        const element = createText(true);

        syncTruncationTitle(element);

        expect(element).toHaveAttribute("title", "Long title");
    });

    it("should find truncated ancestor of hovered element", () => {
        const element = createText(true);
        const child = document.createElement("b");
        element.append(child);

        syncTruncationTitle(child);

        expect(element).toHaveAttribute("title", "Long title");
    });

    it("should not set a title when text fits or is not styled as truncated", () => {
        const fitting = createText(false);
        const unstyled = createText(true, false);

        syncTruncationTitle(fitting);
        syncTruncationTitle(unstyled);

        expect(fitting).not.toHaveAttribute("title");
        expect(unstyled).not.toHaveAttribute("title");
    });

    it("should remove automatic title once the text fits", () => {
        const element = createText(true);
        syncTruncationTitle(element);

        Object.defineProperty(element, "scrollWidth", { value: 100, configurable: true });
        syncTruncationTitle(element);

        expect(element).not.toHaveAttribute("title");
    });

    it("should keep titles authored on the element", () => {
        const element = createText(true);
        element.title = "Authored";

        syncTruncationTitle(element);

        expect(element).toHaveAttribute("title", "Authored");
    });
});
