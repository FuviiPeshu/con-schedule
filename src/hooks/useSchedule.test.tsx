import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_RESPONSE_EF30_MOCK } from "../__mocks__/api.mocks";
import { SCHEDULE_MOCK_DATA } from "../__mocks__/schedule.mocks";
import { buildScheduleData } from "../api";
import { useSchedule } from "./useSchedule";

describe("Hooks / useSchedule", () => {
    const mockedConfiguration = vi.hoisted(() => ({
        syncIntervalMs: 5 * 60 * 1000,
        useMocks: false,
    }));
    const mockedFetchSchedule = vi.hoisted(() => vi.fn());

    vi.mock("../configuration", () => mockedConfiguration);
    vi.mock("../api", async () => {
        const actual = await vi.importActual<typeof import("../api")>("../api");
        return { ...actual, fetchSchedule: mockedFetchSchedule };
    });

    const createWrapper = () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { gcTime: 0, retry: false },
            },
        });

        return ({ children }: PropsWithChildren) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    };

    beforeEach(() => {
        mockedConfiguration.useMocks = false;
        mockedFetchSchedule.mockReset();
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should load and transforms the live API response", async () => {
        mockedFetchSchedule.mockResolvedValue(SCHEDULE_MOCK_DATA);

        const { result } = renderHook(() => useSchedule(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(buildScheduleData(SCHEDULE_MOCK_DATA));
        expect(mockedFetchSchedule).toHaveBeenCalledOnce();
        expect(mockedFetchSchedule).toHaveBeenCalledWith(expect.any(AbortSignal));
    });

    it("should use bundled response without calling the API in mock mode", async () => {
        mockedConfiguration.useMocks = true;

        const { result } = renderHook(() => useSchedule(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(buildScheduleData(API_RESPONSE_EF30_MOCK));
        expect(mockedFetchSchedule).not.toHaveBeenCalled();
    });

    it("should fall back to the small local mock when the API fails", async () => {
        const error = new Error("offline");
        mockedFetchSchedule.mockRejectedValue(error);

        const { result } = renderHook(() => useSchedule(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(buildScheduleData(SCHEDULE_MOCK_DATA));
        expect(console.warn).toHaveBeenCalledWith("Falling back to mock schedule data:", error);
    });

    it("should keep abort errors as query errors", async () => {
        mockedFetchSchedule.mockRejectedValue(new DOMException("Aborted", "AbortError"));

        const { result } = renderHook(() => useSchedule(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.data).toBeUndefined();
        expect(console.warn).not.toHaveBeenCalled();
    });
});
