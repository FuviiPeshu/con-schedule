/** Function for storing values (in localStorage)
 * @template T Type of the value to store
 * @param key Key under which the value should be stored
 * @param value Value to store
 */
export const writeStoredValue = <T>(key: string, value: T): void => {
    if (typeof window === "undefined" || !window.localStorage) {
        return;
    }

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        console.error(`Failed to write value for key: "${key}".`);
    }
};

/** Function for retrieving stored values (from localStorage) with a fallback
 * @template T Expected type of the stored value
 * @param key Key under which the value is stored
 * @param fallback Value to return if the stored value is not found or cannot be parsed
 * @returns stored value if available and parseable, fallback otherwise
 */
export const readStoredValue = <T>(key: string, fallback: T): T => {
    if (typeof window === "undefined" || !window.localStorage) {
        return fallback;
    }

    try {
        const storedValue = window.localStorage.getItem(key);
        return storedValue === null ? fallback : (JSON.parse(storedValue) as T);
    } catch {
        console.error(`Failed to read value for key: "${key}".`);
        return fallback;
    }
};
