import { useEffect, type RefObject, type UIEvent } from "react";

import { readStoredValue, writeStoredValue } from "../utils/storage.utils";
import { useThrottledStorageWrite } from "./useThrottledStorageWrite";

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
    const writeScrollTop = useThrottledStorageWrite<number>(storageKey);

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
        writeScrollTop(event.currentTarget.scrollTop);
    };

    return handleScroll;
};
