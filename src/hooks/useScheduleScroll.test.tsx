import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useScheduleScroll } from "./useScheduleScroll";

const createContent = () => ({ current: { scrollTop: 0 } as HTMLDivElement });

describe("Hooks / useScheduleScroll", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("should restore stored scroll position", () => {
        window.localStorage.setItem("scroll", "240");
        const contentRef = createContent();

        renderHook(() =>
            useScheduleScroll({ contentRef, storageKey: "scroll", reset: false, restoreKey: 0 })
        );

        expect(contentRef.current.scrollTop).toBe(240);
    });

    it("should scroll to the top and forget position on reset", () => {
        window.localStorage.setItem("scroll", "240");
        const contentRef = createContent();

        renderHook(() =>
            useScheduleScroll({ contentRef, storageKey: "scroll", reset: true, restoreKey: 0 })
        );

        expect(contentRef.current.scrollTop).toBe(0);
        expect(window.localStorage.getItem("scroll")).toBe("0");
    });

    it("should restore again once schedule data has arrived", () => {
        window.localStorage.setItem("scroll", "300");
        const contentRef = createContent();
        const { rerender } = renderHook(
            ({ restoreKey }) =>
                useScheduleScroll({ contentRef, storageKey: "scroll", reset: false, restoreKey }),
            { initialProps: { restoreKey: 0 } }
        );

        contentRef.current.scrollTop = 0;
        rerender({ restoreKey: 25 });

        expect(contentRef.current.scrollTop).toBe(300);
    });
});
