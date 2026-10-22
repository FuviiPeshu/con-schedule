import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent, RefObject } from "react";

import { conId } from "../configuration";
import type { CalendarOrientation } from "../schedule.types";
import { readStoredValue } from "../utils/storage.utils";
import { useThrottledStorageWrite } from "./useThrottledStorageWrite";

const horizontalScrollStorageKey = `con-schedule:${conId}:calendar:scroll-x`;
const panStartThresholdPx = 4; // pointer travel below this distance is treated as a click, not a drag

type PanGesture = {
    pointerId: number;
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
    moved: boolean;
    canScrollHorizontally: boolean;
    canScrollVertically: boolean;
};

interface UseCalendarGridInteractionsParams {
    scheduleContentRef: RefObject<HTMLDivElement | null>;
    activeDay: string;
    orientation: CalendarOrientation;
    /** Number of events in the grid; the viewport only exists while this is above zero */
    eventCount: number;
}

/** Measures the calendar viewport and owns its scrolling: synced scrollbars, drag-to-pan, persisted offset */
export const useCalendarGridInteractions = ({
    scheduleContentRef,
    activeDay,
    orientation,
    eventCount,
}: UseCalendarGridInteractionsParams) => {
    const [availableWidth, setAvailableWidth] = useState(0);
    const [availableHeight, setAvailableHeight] = useState(0);
    const [isPanning, setIsPanning] = useState(false);
    const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);
    const [hasVerticalOverflow, setHasVerticalOverflow] = useState(false);

    const viewportRef = useRef<HTMLDivElement>(null);
    const horizontalScrollRef = useRef<HTMLDivElement>(null);
    const calendarCanvasRef = useRef<HTMLDivElement>(null);
    const roomHeaderRef = useRef<HTMLDivElement>(null);
    const panRef = useRef<PanGesture | null>(null);
    const suppressClickRef = useRef(false);
    const writeHorizontalScroll = useThrottledStorageWrite<number>(horizontalScrollStorageKey);
    const hasGrid = eventCount > 0;

    const syncHorizontalScroll = useCallback(
        (scrollLeft: number) => {
            const viewport = viewportRef.current;
            const maxScrollLeft = viewport
                ? Math.max(0, viewport.scrollWidth - viewport.clientWidth)
                : Math.max(
                      0,
                      (horizontalScrollRef.current?.scrollWidth ?? 0) -
                          (horizontalScrollRef.current?.clientWidth ?? 0)
                  );
            const boundedScrollLeft = Math.min(Math.max(0, scrollLeft), maxScrollLeft);

            writeHorizontalScroll(boundedScrollLeft);

            if (viewport && viewport.scrollLeft !== boundedScrollLeft) {
                viewport.scrollLeft = boundedScrollLeft;
            }

            if (
                horizontalScrollRef.current &&
                horizontalScrollRef.current.scrollLeft !== boundedScrollLeft
            ) {
                horizontalScrollRef.current.scrollLeft = boundedScrollLeft;
            }

            if (roomHeaderRef.current) {
                roomHeaderRef.current.style.transform = `translateX(-${boundedScrollLeft}px)`;
            }
        },
        [writeHorizontalScroll]
    );

    const startGridPan = (event: PointerEvent<HTMLDivElement>) => {
        suppressClickRef.current = false;

        if (event.button !== 0 || (event.target as HTMLElement).closest("button")) {
            return;
        }

        const viewport = viewportRef.current;
        const scheduleContent = scheduleContentRef.current;
        const canScrollHorizontally = Boolean(
            viewport && viewport.scrollWidth > viewport.clientWidth + 1
        );
        const canScrollVertically = Boolean(
            scheduleContent && scheduleContent.scrollHeight > scheduleContent.clientHeight + 1
        );

        if (!canScrollHorizontally && !canScrollVertically) {
            return;
        }

        panRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startScrollLeft: viewportRef.current?.scrollLeft ?? 0,
            startScrollTop: scheduleContentRef.current?.scrollTop ?? 0,
            moved: false,
            canScrollHorizontally,
            canScrollVertically,
        };
    };

    const moveGridPan = (event: PointerEvent<HTMLDivElement>) => {
        const pan = panRef.current;

        if (!pan || pan.pointerId !== event.pointerId) {
            return;
        }

        const deltaX = event.clientX - pan.startX;
        const deltaY = event.clientY - pan.startY;

        if (!pan.moved) {
            if (Math.hypot(deltaX, deltaY) < panStartThresholdPx) {
                return;
            }

            pan.moved = true;
            // Capturing earlier would redirect the click away from the event link
            event.currentTarget.setPointerCapture?.(event.pointerId);
            setIsPanning(true);
        }

        event.preventDefault();
        if (pan.canScrollHorizontally) {
            syncHorizontalScroll(pan.startScrollLeft - deltaX);
        }

        if (pan.canScrollVertically && scheduleContentRef.current) {
            const maxScrollTop = Math.max(
                0,
                scheduleContentRef.current.scrollHeight - scheduleContentRef.current.clientHeight
            );
            scheduleContentRef.current.scrollTop = Math.min(
                maxScrollTop,
                Math.max(0, pan.startScrollTop - deltaY)
            );
        }
    };

    const finishGridPan = (event: PointerEvent<HTMLDivElement>) => {
        const pan = panRef.current;

        if (!pan || pan.pointerId !== event.pointerId) {
            return;
        }

        suppressClickRef.current = pan.moved;
        panRef.current = null;
        setIsPanning(false);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
    };

    const suppressDraggedLinkClick = (event: MouseEvent<HTMLDivElement>) => {
        if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
        }
    };

    useEffect(() => {
        syncHorizontalScroll(readStoredValue(horizontalScrollStorageKey, 0));
    }, [activeDay, availableWidth, orientation, syncHorizontalScroll]);

    useEffect(() => {
        const viewport = viewportRef.current;

        if (!viewport) {
            return;
        }

        const updateDimensions = () => {
            setAvailableWidth(viewport.clientWidth);
            setAvailableHeight(viewport.clientHeight);
        };

        updateDimensions();

        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(updateDimensions);
        observer.observe(viewport);

        return () => observer.disconnect();
    }, [hasGrid]);

    useEffect(() => {
        const viewport = viewportRef.current;
        const canvas = calendarCanvasRef.current;
        const scheduleContent = scheduleContentRef.current;

        if (!viewport) {
            return;
        }

        const updateOverflow = () => {
            setHasHorizontalOverflow(viewport.scrollWidth > viewport.clientWidth + 1);
            setHasVerticalOverflow(
                Boolean(
                    scheduleContent &&
                    scheduleContent.scrollHeight > scheduleContent.clientHeight + 1
                )
            );
        };

        updateOverflow();

        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(updateOverflow);
        observer.observe(viewport);
        if (canvas) {
            observer.observe(canvas);
        }
        if (scheduleContent) {
            observer.observe(scheduleContent);
        }

        return () => observer.disconnect();
    }, [activeDay, availableHeight, availableWidth, eventCount, orientation, scheduleContentRef]);

    return {
        availableWidth,
        availableHeight,
        isPanning,
        hasHorizontalOverflow,
        hasVerticalOverflow,
        viewportRef,
        horizontalScrollRef,
        calendarCanvasRef,
        roomHeaderRef,
        startGridPan,
        moveGridPan,
        finishGridPan,
        suppressDraggedLinkClick,
        syncHorizontalScroll,
    };
};
