/** Writes JSON value to localStorage when storage is available */
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

/** Reads JSON value, falling back when storage is missing, unavailable, or malformed */
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

/** Creates parser that accepts only one of the listed options and otherwise returns the fallback */
export const oneOf =
    <T extends string | number>(options: readonly T[], fallback: T) =>
    (stored: unknown): T =>
        options.includes(stored as T) ? (stored as T) : fallback;

/** Creates parser that accepts only booleans and otherwise returns the fallback */
export const booleanOr =
    (fallback: boolean) =>
    (stored: unknown): boolean =>
        typeof stored === "boolean" ? stored : fallback;
