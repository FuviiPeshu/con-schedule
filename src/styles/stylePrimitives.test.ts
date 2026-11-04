import { describe, expect, it } from "vitest";

import { transition } from "./stylePrimitives";

describe("Styles / Style Primitives", () => {
    it("should build transition with the default timing", () => {
        expect(transition({ properties: "color" })).toBe("transition: color 256ms ease;");
    });

    it("should combine several properties with chosen duration and easing", () => {
        expect(
            transition({
                properties: ["background-color", "border-color"],
                duration: "fast",
                easing: "out",
            })
        ).toBe("transition: background-color 160ms ease-out, border-color 160ms ease-out;");
    });
});
