import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedValue } from "./useDebouncedValue";

describe("Hooks / useDebouncedValue", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should start with the initial value", () => {
        const { result } = renderHook(() => useDebouncedValue("a", 100));

        expect(result.current).toBe("a");
    });

    it("should publish only the latest value once the delay has passed without changes", () => {
        const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 100), {
            initialProps: { value: "a" },
        });

        rerender({ value: "ab" });
        act(() => vi.advanceTimersByTime(60));
        rerender({ value: "abc" });
        act(() => vi.advanceTimersByTime(60));

        expect(result.current).toBe("a");

        act(() => vi.advanceTimersByTime(40));

        expect(result.current).toBe("abc");
    });
});
