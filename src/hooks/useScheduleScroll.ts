import { useEffect, useRef, type RefObject, type UIEvent } from "react";

import { readStoredValue, writeStoredValue } from "../utils/storage.utils";

interface UseScheduleScrollParams {
    contentRef: RefObject<HTMLDivElement | null>;
    storageKey: string;
    reset: boolean;
    restoreKey: number;
}

export const useScheduleScroll = ({
    contentRef,
    storageKey,
    reset,
    restoreKey,
}: UseScheduleScrollParams) => {
    const scrollFrameRef = useRef<number | null>(null);
    const pendingScrollTopRef = useRef(0);

    useEffect(() => {
        if (contentRef.current) {
            const restoredScrollTop = reset ? 0 : readStoredValue(storageKey, 0);

            contentRef.current.scrollTop = restoredScrollTop;

            if (reset) {
                writeStoredValue(storageKey, 0);
            }
        }
    }, [contentRef, reset, restoreKey, storageKey]);

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        pendingScrollTopRef.current = event.currentTarget.scrollTop;

        if (scrollFrameRef.current !== null || typeof window === "undefined") {
            return;
        }

        scrollFrameRef.current = window.requestAnimationFrame(() => {
            writeStoredValue(storageKey, pendingScrollTopRef.current);
            scrollFrameRef.current = null;
        });
    };

    useEffect(() => {
        return () => {
            if (scrollFrameRef.current !== null) {
                window.cancelAnimationFrame(scrollFrameRef.current);
            }
        };
    }, []);

    return handleScroll;
};
