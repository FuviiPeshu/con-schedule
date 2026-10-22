import { useCallback, useEffect, useRef } from "react";

import { writeStoredValue } from "../utils/storage.utils";

/** Returns a writer that links rapid updates (like scroll events) into one storage write per frame */
export const useThrottledStorageWrite = <T>(storageKey: string) => {
    const frameRef = useRef<number | null>(null);
    const pendingValueRef = useRef<T>(undefined as T);

    useEffect(
        () => () => {
            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current);
            }
        },
        []
    );

    return useCallback(
        (value: T) => {
            pendingValueRef.current = value;

            if (frameRef.current !== null) {
                return;
            }

            frameRef.current = window.requestAnimationFrame(() => {
                frameRef.current = null;
                writeStoredValue(storageKey, pendingValueRef.current);
            });
        },
        [storageKey]
    );
};
