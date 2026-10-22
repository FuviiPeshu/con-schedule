import { useRef } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { conId } from "../configuration";
import { CalendarOrientation } from "../schedule.types";
import { useCalendarGridInteractions } from "./useCalendarGridInteractions";

const scrollKey = `con-schedule:${conId}:calendar:scroll-x`;

type Metrics = {
    clientWidth: number;
    clientHeight: number;
    scrollWidth: number;
    scrollHeight: number;
};

const metrics: Metrics = {
    clientWidth: 800,
    clientHeight: 600,
    scrollWidth: 2000,
    scrollHeight: 1500,
};

const setPointerCapture = vi.fn();

// jsdom has no PointerEvent, so testing-library would drop the pointer id and coordinates
class PointerEventPolyfill extends MouseEvent {
    pointerId: number;

    constructor(type: string, init: MouseEventInit & { pointerId?: number } = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
    }
}

const Harness = ({ eventCount = 1 }: { eventCount?: number }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const grid = useCalendarGridInteractions({
        scheduleContentRef: contentRef,
        activeDay: "2026-08-20",
        orientation: CalendarOrientation.Rooms,
        eventCount,
    });

    return (
        <div ref={contentRef} data-testid="content">
            <div ref={grid.roomHeaderRef} data-testid="header" />
            {eventCount > 0 && (
                <div
                    ref={grid.viewportRef}
                    data-testid="viewport"
                    onPointerDown={grid.startGridPan}
                    onPointerMove={grid.moveGridPan}
                    onPointerUp={grid.finishGridPan}
                    onClickCapture={grid.suppressDraggedLinkClick}
                    onScroll={() => grid.syncHorizontalScroll(0)}
                >
                    <div ref={grid.calendarCanvasRef} />
                    <button type="button">Hide</button>
                    <a href="#event">Event</a>
                </div>
            )}
            <output data-testid="state">
                {JSON.stringify({
                    width: grid.availableWidth,
                    height: grid.availableHeight,
                    panning: grid.isPanning,
                    overflowX: grid.hasHorizontalOverflow,
                    overflowY: grid.hasVerticalOverflow,
                })}
            </output>
        </div>
    );
};

const readState = () => JSON.parse(screen.getByTestId("state").textContent ?? "{}");

const drag = (target: Element, from: [number, number], to: [number, number], pointerId = 1) => {
    fireEvent.pointerDown(target, { pointerId, clientX: from[0], clientY: from[1], button: 0 });
    fireEvent.pointerMove(target, { pointerId, clientX: to[0], clientY: to[1] });
};

describe("Hooks / useCalendarGridInteractions", () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.stubGlobal("PointerEvent", PointerEventPolyfill);
        Object.assign(metrics, {
            clientWidth: 800,
            clientHeight: 600,
            scrollWidth: 2000,
            scrollHeight: 1500,
        });

        vi.spyOn(Element.prototype, "clientWidth", "get").mockImplementation(
            () => metrics.clientWidth
        );
        vi.spyOn(Element.prototype, "clientHeight", "get").mockImplementation(
            () => metrics.clientHeight
        );
        vi.spyOn(Element.prototype, "scrollWidth", "get").mockImplementation(
            () => metrics.scrollWidth
        );
        vi.spyOn(Element.prototype, "scrollHeight", "get").mockImplementation(
            () => metrics.scrollHeight
        );
        // jsdom has no pointer capture API
        Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
            configurable: true,
            value: setPointerCapture,
        });
        setPointerCapture.mockClear();
    });

    afterEach(() => {
        Reflect.deleteProperty(HTMLElement.prototype, "setPointerCapture");
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("should measure viewport and overflow", () => {
        render(<Harness />);

        expect(readState()).toMatchObject({
            width: 800,
            height: 600,
            overflowX: true,
            overflowY: true,
        });
    });

    it("should measure viewport once the grid appears", () => {
        const { rerender } = render(<Harness eventCount={0} />);
        expect(readState()).toMatchObject({ width: 0, height: 0 });

        rerender(<Harness eventCount={3} />);

        expect(readState()).toMatchObject({ width: 800, height: 600 });
    });

    it("should follow viewport resizes", () => {
        const callbacks: Array<() => void> = [];
        const disconnect = vi.fn();
        vi.stubGlobal(
            "ResizeObserver",
            class {
                constructor(callback: () => void) {
                    callbacks.push(callback);
                }
                observe() {}
                disconnect = disconnect;
            }
        );

        const { unmount } = render(<Harness />);
        metrics.clientWidth = 500;
        act(() => callbacks.forEach((callback) => callback()));

        expect(readState().width).toBe(500);

        unmount();
        expect(disconnect).toHaveBeenCalled();
    });

    it("should pan the grid by dragging", () => {
        render(<Harness />);
        const viewport = screen.getByTestId("viewport");

        drag(viewport, [300, 100], [200, 100]);

        expect(viewport.scrollLeft).toBe(100);
        expect(setPointerCapture).toHaveBeenCalledOnce();
        expect(setPointerCapture).toHaveBeenCalledWith(1);
        expect(screen.getByTestId("header").style.transform).toBe("translateX(-100px)");
        expect(readState().panning).toBe(true);

        fireEvent.pointerUp(viewport, { pointerId: 1 });
        expect(readState().panning).toBe(false);
    });

    it("should keep scroll position within the scrollable range", () => {
        render(<Harness />);
        const viewport = screen.getByTestId("viewport");

        drag(viewport, [100, 0], [900, 0]);
        expect(viewport.scrollLeft).toBe(0);

        fireEvent.pointerUp(viewport, { pointerId: 1 });
        drag(viewport, [900, 0], [-5000, 0]);
        expect(viewport.scrollLeft).toBe(1200);
    });

    it("should pan schedule content vertically within its range", () => {
        render(<Harness />);
        const viewport = screen.getByTestId("viewport");
        const content = screen.getByTestId("content");

        drag(viewport, [0, 400], [0, 300]);
        expect(content.scrollTop).toBe(100);

        fireEvent.pointerUp(viewport, { pointerId: 1 });
        drag(viewport, [0, 400], [0, -9000]);
        expect(content.scrollTop).toBe(900);
    });

    it("should suppress click that ends a drag but not later clicks", () => {
        render(<Harness />);
        const viewport = screen.getByTestId("viewport");
        const link = screen.getByRole("link", { name: "Event" });

        drag(viewport, [300, 100], [200, 100]);
        fireEvent.pointerUp(viewport, { pointerId: 1 });

        expect(fireEvent.click(link)).toBe(false);
        expect(fireEvent.click(link)).toBe(true);
    });

    it("should treat tiny pointer movement as a click", () => {
        render(<Harness />);
        const viewport = screen.getByTestId("viewport");
        const link = screen.getByRole("link", { name: "Event" });

        drag(viewport, [300, 100], [302, 101]);
        fireEvent.pointerUp(viewport, { pointerId: 1 });

        expect(viewport.scrollLeft).toBe(0);
        expect(readState().panning).toBe(false);
        expect(setPointerCapture).not.toHaveBeenCalled();
        expect(fireEvent.click(link)).toBe(true);
    });

    it("should not start panning from buttons, secondary buttons, or other pointers", () => {
        render(<Harness />);
        const viewport = screen.getByTestId("viewport");

        drag(screen.getByRole("button", { name: "Hide" }), [300, 0], [100, 0]);
        expect(viewport.scrollLeft).toBe(0);

        fireEvent.pointerDown(viewport, { pointerId: 1, clientX: 300, button: 2 });
        fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 100 });
        expect(viewport.scrollLeft).toBe(0);

        fireEvent.pointerDown(viewport, { pointerId: 1, clientX: 300, button: 0 });
        fireEvent.pointerMove(viewport, { pointerId: 9, clientX: 100 });
        expect(viewport.scrollLeft).toBe(0);
    });

    it("should not pan when nothing can scroll", () => {
        metrics.scrollWidth = 800;
        metrics.scrollHeight = 600;
        render(<Harness />);
        const viewport = screen.getByTestId("viewport");

        drag(viewport, [300, 300], [100, 100]);

        expect(viewport.scrollLeft).toBe(0);
        expect(screen.getByTestId("content").scrollTop).toBe(0);
        expect(readState().panning).toBe(false);
    });

    it("should restore stored horizontal position and persist later changes", async () => {
        window.localStorage.setItem(scrollKey, "150");
        render(<Harness />);
        const viewport = screen.getByTestId("viewport");

        expect(viewport.scrollLeft).toBe(150);

        drag(viewport, [300, 0], [250, 0]);
        await waitFor(() => expect(window.localStorage.getItem(scrollKey)).toBe("200"));
    });
});
