import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useThrottledStorageWrite } from "./useThrottledStorageWrite";

describe("Hooks / useThrottledStorageWrite", () => {
    let frames: Map<number, FrameRequestCallback>;
    let nextFrameId: number;

    const runFrames = () => {
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach((callback) => callback(0));
    };

    beforeEach(() => {
        window.localStorage.clear();
        frames = new Map();
        nextFrameId = 1;

        vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
            const id = nextFrameId++;
            frames.set(id, callback);
            return id;
        });
        vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
            frames.delete(id);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should not write before the next frame", () => {
        const { result } = renderHook(() => useThrottledStorageWrite<number>("scroll"));

        result.current(10);

        expect(window.localStorage.getItem("scroll")).toBeNull();
    });

    it("should coalesce rapid updates into one write of the latest value", () => {
        const setItem = vi.spyOn(Storage.prototype, "setItem");
        const { result } = renderHook(() => useThrottledStorageWrite<number>("scroll"));

        result.current(10);
        result.current(20);
        result.current(30);

        expect(frames.size).toBe(1);

        runFrames();

        expect(setItem).toHaveBeenCalledTimes(1);
        expect(window.localStorage.getItem("scroll")).toBe("30");
    });

    it("should drop a pending write when unmounted", () => {
        const { result, unmount } = renderHook(() => useThrottledStorageWrite<number>("scroll"));

        result.current(10);
        unmount();
        runFrames();

        expect(window.localStorage.getItem("scroll")).toBeNull();
    });
});
