import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { booleanOr, oneOf } from "../utils/storage.utils";
import { usePersistedState } from "./usePersistedState";

describe("Hooks / usePersistedState", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("should use parsed default when nothing is stored and persist it", () => {
        const { result } = renderHook(() => usePersistedState("flag", booleanOr(true)));

        expect(result.current[0]).toBe(true);
        expect(window.localStorage.getItem("flag")).toBe("true");
    });

    it("should restore valid stored value", () => {
        window.localStorage.setItem("mode", '"compact"');

        const { result } = renderHook(() =>
            usePersistedState("mode", oneOf(["full", "compact"] as const, "full"))
        );

        expect(result.current[0]).toBe("compact");
    });

    it("should replace invalid stored value with the default one", () => {
        window.localStorage.setItem("mode", '"gigantic"');

        const { result } = renderHook(() =>
            usePersistedState("mode", oneOf(["full", "compact"] as const, "full"))
        );

        expect(result.current[0]).toBe("full");
        expect(window.localStorage.getItem("mode")).toBe('"full"');
    });

    it("should persist every update", () => {
        const { result } = renderHook(() => usePersistedState("flag", booleanOr(true)));

        act(() => result.current[1](false));

        expect(result.current[0]).toBe(false);
        expect(window.localStorage.getItem("flag")).toBe("false");
    });
});
