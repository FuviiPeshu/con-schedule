import { fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useTruncationTooltips } from "./useTruncationTooltips";

describe("Hooks / useTruncationTooltips", () => {
    it("should add title to truncated element on hover and stop after unmount", () => {
        const element = document.createElement("span");
        element.textContent = "Long title";
        element.style.textOverflow = "ellipsis";
        Object.defineProperty(element, "scrollWidth", { value: 200 });
        Object.defineProperty(element, "clientWidth", { value: 100 });
        document.body.append(element);

        const { unmount } = renderHook(() => useTruncationTooltips());
        fireEvent.mouseOver(element);

        expect(element).toHaveAttribute("title", "Long title");

        element.removeAttribute("title");
        unmount();
        fireEvent.mouseOver(element);

        expect(element).not.toHaveAttribute("title");
        element.remove();
    });
});
