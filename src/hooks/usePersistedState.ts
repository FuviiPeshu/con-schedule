import { useEffect, useState } from "react";

import { readStoredValue, writeStoredValue } from "../utils/storage.utils";

/**
 * `useState` mirrored to localStorage. Stored data is untrusted, so `parse` must turn
 * whatever was stored into a valid value (or `undefined` when nothing was stored).
 */
export const usePersistedState = <T>(key: string, parse: (stored: unknown) => T) => {
    const [value, setValue] = useState<T>(() => parse(readStoredValue<unknown>(key, undefined)));

    useEffect(() => {
        writeStoredValue(key, value);
    }, [key, value]);

    return [value, setValue] as const;
};
