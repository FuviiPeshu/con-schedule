import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { booleanOr, oneOf, readStoredValue, writeStoredValue } from "./storage.utils";

const createStorageMock = (): Storage => {
    const values = new Map<string, string>();

    return {
        get length() {
            return values.size;
        },
        clear: vi.fn(() => values.clear()),
        getItem: vi.fn((key: string) => values.get(key) ?? null),
        key: vi.fn((index: number) => [...values.keys()][index] ?? null),
        removeItem: vi.fn((key: string) => values.delete(key)),
        setItem: vi.fn((key: string, value: string) => values.set(key, String(value))),
    } as unknown as Storage;
};

describe("Utils / Storage", () => {
    let storage: Storage;
    let consoleError: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        storage = createStorageMock();
        vi.spyOn(window, "localStorage", "get").mockReturnValue(storage);
        consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("should serialize and deserialize stored values", () => {
        const value = { view: "calendar", pageSize: 20, rooms: ["Auditorium"] };

        writeStoredValue("schedule-preferences", value);

        expect(storage.getItem("schedule-preferences")).toBe(JSON.stringify(value));
        expect(readStoredValue("schedule-preferences", {})).toEqual(value);
    });

    it("should return the fallback when a key is missing", () => {
        const fallback = { view: "list" };

        expect(readStoredValue("missing-preferences", fallback)).toBe(fallback);
    });

    it("should return the fallback and log when stored JSON is malformed", () => {
        storage.setItem("malformed", "{not-json");

        expect(readStoredValue("malformed", "fallback")).toBe("fallback");
        expect(consoleError).toHaveBeenCalledWith('Failed to read value for key: "malformed".');
    });

    it("should handle write failures and log the storage key", () => {
        storage.setItem = vi.fn(() => {
            throw new Error("Mock error");
        });

        expect(() => writeStoredValue("blocked", { enabled: true })).not.toThrow();
        expect(consoleError).toHaveBeenCalledWith('Failed to write value for key: "blocked".');
    });

    it("should handle read failures and return the fallback", () => {
        storage.getItem = vi.fn(() => {
            throw new Error("Storage unavailable");
        });

        expect(readStoredValue("blocked", 42)).toBe(42);
        expect(consoleError).toHaveBeenCalledWith('Failed to read value for key: "blocked".');
    });

    it("should do nothing and not throw when localStorage is unavailable", () => {
        vi.stubGlobal("window", undefined);

        expect(() => writeStoredValue("unavailable", true)).not.toThrow();
        expect(readStoredValue("unavailable", false)).toBe(false);
    });

    it("should accept only listed options when parsing stored values", () => {
        const parseSize = oneOf([5, 10, "full-day"] as const, 10);

        expect(parseSize(5)).toBe(5);
        expect(parseSize("full-day")).toBe("full-day");
        expect(parseSize(7)).toBe(10);
        expect(parseSize("5")).toBe(10);
        expect(parseSize(undefined)).toBe(10);
        expect(parseSize(null)).toBe(10);
    });

    it("should accept only booleans when parsing stored values", () => {
        expect(booleanOr(true)(false)).toBe(false);
        expect(booleanOr(false)(true)).toBe(true);
        expect(booleanOr(true)("false")).toBe(true);
        expect(booleanOr(false)(undefined)).toBe(false);
    });
});
