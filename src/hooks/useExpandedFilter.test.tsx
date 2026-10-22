import type { FocusEvent, MouseEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useExpandedFilter } from "./useExpandedFilter";

const room = { filterKey: "room" as const };
const date = { filterKey: "date" as const };

const mouseLeave = (currentTarget: HTMLElement, relatedTarget: Node | null = null) =>
    ({ currentTarget, relatedTarget }) as unknown as MouseEvent<HTMLElement>;

const blur = (currentTarget: HTMLElement, relatedTarget: Node | null = null) =>
    ({ currentTarget, relatedTarget }) as unknown as FocusEvent<HTMLElement>;

describe("Hooks / useExpandedFilter", () => {
    const setup = (initial = { enabled: true, activeFilters: [room, date] }) =>
        renderHook((props) => useExpandedFilter(props), { initialProps: initial });

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.replaceChildren();
    });

    it("should expand one filter at a time", () => {
        const { result } = setup();

        act(() => result.current.expandFilter("room"));
        expect(result.current.expandedFilter).toBe("room");

        act(() => result.current.expandFilter("date"));
        expect(result.current.expandedFilter).toBe("date");
    });

    it("should fade first and collapse after the delay once the pointer leaves", () => {
        const { result } = setup();
        const chip = document.createElement("div");

        act(() => result.current.expandFilter("room"));
        act(() => result.current.handleMouseLeave("room", mouseLeave(chip)));

        expect(result.current.fadingFilter).toBe("room");
        expect(result.current.expandedFilter).toBe("room");

        act(() => vi.advanceTimersByTime(500));

        expect(result.current.expandedFilter).toBeNull();
        expect(result.current.fadingFilter).toBeNull();
    });

    it("should stay expanded when the pointer returns before the delay ends", () => {
        const { result } = setup();

        act(() => result.current.expandFilter("room"));
        act(() =>
            result.current.handleMouseLeave("room", mouseLeave(document.createElement("div")))
        );
        act(() => vi.advanceTimersByTime(250));
        act(() => result.current.keepExpanded("room"));
        act(() => vi.advanceTimersByTime(500));

        expect(result.current.expandedFilter).toBe("room");
        expect(result.current.fadingFilter).toBeNull();
    });

    it("should not collapse while the pointer moves to a child or focus is inside", () => {
        const { result } = setup();
        const chip = document.createElement("div");
        const child = document.createElement("button");
        chip.append(child);
        document.body.append(chip);

        act(() => result.current.expandFilter("room"));
        act(() => result.current.handleMouseLeave("room", mouseLeave(chip, child)));
        expect(result.current.fadingFilter).toBeNull();

        child.focus();
        act(() => result.current.handleMouseLeave("room", mouseLeave(chip)));
        act(() => vi.advanceTimersByTime(500));

        expect(result.current.expandedFilter).toBe("room");
    });

    it("should collapse on blur unless focus stays inside the chip", () => {
        const { result } = setup();
        const chip = document.createElement("div");
        const child = document.createElement("button");
        chip.append(child);

        act(() => result.current.expandFilter("room"));
        act(() => result.current.handleBlur("room", blur(chip, child)));
        act(() => vi.advanceTimersByTime(500));
        expect(result.current.expandedFilter).toBe("room");

        act(() => result.current.handleBlur("room", blur(chip)));
        act(() => vi.advanceTimersByTime(500));
        expect(result.current.expandedFilter).toBeNull();
    });

    it("should ignore leave events for a filter that is not expanded", () => {
        const { result } = setup();

        act(() => result.current.expandFilter("room"));
        act(() =>
            result.current.handleMouseLeave("date", mouseLeave(document.createElement("div")))
        );

        expect(result.current.fadingFilter).toBeNull();
    });

    it("should collapse immediately on request and cancel a pending fade", () => {
        const { result } = setup();

        act(() => result.current.expandFilter("room"));
        act(() =>
            result.current.handleMouseLeave("room", mouseLeave(document.createElement("div")))
        );
        act(() => result.current.collapse());

        expect(result.current.expandedFilter).toBeNull();
        expect(result.current.fadingFilter).toBeNull();
    });

    it("should collapse when the expanded filter is no longer applied", () => {
        const { result, rerender } = setup();

        act(() => result.current.expandFilter("room"));
        rerender({ enabled: true, activeFilters: [date] });

        expect(result.current.expandedFilter).toBeNull();
    });

    it("should collapse when chips stop being expandable", () => {
        const { result, rerender } = setup();

        act(() => result.current.expandFilter("room"));
        rerender({ enabled: false, activeFilters: [room, date] });

        expect(result.current.expandedFilter).toBeNull();
    });
});
