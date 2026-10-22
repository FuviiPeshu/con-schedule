import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultPageSize, fullDayPageSize, storagePrefix } from "../configuration";
import { usePaginatedSchedule } from "./usePaginatedSchedule";

const pageSizeKey = `${storagePrefix}:page-size`;

type Item = { id: number; day: string };

const numberedItems = (count: number): Item[] =>
    Array.from({ length: count }, (_, index) => ({ id: index + 1, day: "d1" }));

const setup = (
    items: Item[],
    query = "",
    options: Partial<Parameters<typeof usePaginatedSchedule<Item>>[0]> = {}
) => {
    const updateSearchParams = vi.fn();
    const scheduleContentRef = { current: { scrollTop: 120 } as HTMLDivElement };
    const hook = renderHook(() =>
        usePaginatedSchedule<Item>({
            items,
            searchParams: new URLSearchParams(query),
            updateSearchParams,
            scheduleContentRef,
            ...options,
        })
    );

    return { ...hook, updateSearchParams, scheduleContentRef };
};

describe("Hooks / usePaginatedSchedule", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("should slice items into pages of the default size", () => {
        const { result } = setup(numberedItems(25));

        expect(result.current.pageSize).toBe(defaultPageSize);
        expect(result.current.totalPages).toBe(3);
        expect(result.current.currentPage).toBe(1);
        expect(result.current.itemsOnPage.map((item) => item.id)).toEqual(
            numberedItems(10).map((item) => item.id)
        );
        expect([result.current.pageStart, result.current.pageEnd]).toEqual([1, 10]);
    });

    it("should show last, partially filled page", () => {
        const { result } = setup(numberedItems(25), "page=3");

        expect(result.current.itemsOnPage).toHaveLength(5);
        expect([result.current.pageStart, result.current.pageEnd]).toEqual([21, 25]);
    });

    it("should clamp out-of-range or invalid page", () => {
        expect(setup(numberedItems(25), "page=99").result.current.currentPage).toBe(3);
        expect(setup(numberedItems(25), "page=-4").result.current.currentPage).toBe(1);
        expect(setup(numberedItems(25), "page=abc").result.current.currentPage).toBe(1);
    });

    it("should report empty list as a single page with no range", () => {
        const { result } = setup([]);

        expect(result.current.totalItems).toBe(0);
        expect(result.current.totalPages).toBe(1);
        expect([result.current.pageStart, result.current.pageEnd]).toEqual([0, 0]);
        expect(result.current.itemsOnPage).toEqual([]);
    });

    it("should restore stored page size and fall back from invalid ones", () => {
        window.localStorage.setItem(pageSizeKey, "5");
        expect(setup(numberedItems(12)).result.current.pageSize).toBe(5);

        window.localStorage.setItem(pageSizeKey, '"huge"');
        expect(setup(numberedItems(12)).result.current.pageSize).toBe(defaultPageSize);

        window.localStorage.setItem(pageSizeKey, "7");
        expect(setup(numberedItems(12)).result.current.pageSize).toBe(defaultPageSize);
    });

    it("should change and persist page size, staying on the first visible item", () => {
        const { result, updateSearchParams, scheduleContentRef } = setup(
            numberedItems(25),
            "page=2"
        );

        act(() => result.current.setSelectedPageSize("5"));

        expect(result.current.pageSize).toBe(5);
        expect(window.localStorage.getItem(pageSizeKey)).toBe("5");
        expect(scheduleContentRef.current.scrollTop).toBe(0);

        const params = new URLSearchParams("page=2&date=2026-08-20");
        updateSearchParams.mock.calls[0][0](params);

        expect(params.get("page")).toBe("3"); // item 11 is on page 3 with 5 per page
        expect(params.has("date")).toBe(false);
    });

    it.each([
        ["page=3", "20", "2"],
        ["page=3", "100", "1"],
    ])(
        "should land on the page holding the current first item (%s -> size %s)",
        (query, size, page) => {
            const { result, updateSearchParams } = setup(numberedItems(150), query);

            act(() => result.current.setSelectedPageSize(size));
            const params = new URLSearchParams();
            updateSearchParams.mock.calls[0][0](params);

            expect(params.get("page")).toBe(page);
        }
    );

    it("should map between FULL DAY and numeric pages by the first visible item", () => {
        const days: Item[] = Array.from({ length: 12 }, (_, index) => ({
            id: index + 1,
            day: `d${Math.floor(index / 4) + 1}`,
        }));
        const getGroupKey = (item: Item) => item.day;

        window.localStorage.setItem(pageSizeKey, "5");
        const toFullDay = setup(days, "page=2", { getGroupKey });
        act(() => toFullDay.result.current.setSelectedPageSize(fullDayPageSize));
        const fullDayParams = new URLSearchParams();
        toFullDay.updateSearchParams.mock.calls[0][0](fullDayParams);

        expect(fullDayParams.get("page")).toBe("2"); // item 6 belongs to day d2

        const fromFullDay = setup(days, "", {
            getGroupKey,
            pageSizeOverride: fullDayPageSize,
            selectedGroupKey: "d3",
        });
        act(() => fromFullDay.result.current.setSelectedPageSize("5"));
        const numericParams = new URLSearchParams();
        fromFullDay.updateSearchParams.mock.calls[0][0](numericParams);

        expect(numericParams.get("page")).toBe("2"); // d3 starts at item 9, page 2 of 5
    });

    it("should ignore page sizes that are not offered", () => {
        const { result, updateSearchParams } = setup(numberedItems(25));

        act(() => result.current.setSelectedPageSize("13"));

        expect(result.current.pageSize).toBe(defaultPageSize);
        expect(updateSearchParams).not.toHaveBeenCalled();
    });

    it("should go to a page, clear the day, and let the caller add extra params", () => {
        const updatePageParams = vi.fn((params: URLSearchParams, page: number) =>
            params.set("extra", String(page))
        );
        const { result, updateSearchParams, scheduleContentRef } = setup(numberedItems(25), "", {
            updatePageParams,
        });

        act(() => result.current.goToPage(2));

        const params = new URLSearchParams("date=2026-08-20");
        updateSearchParams.mock.calls[0][0](params);

        expect(params.get("page")).toBe("2");
        expect(params.has("date")).toBe(false);
        expect(params.get("extra")).toBe("2");
        expect(scheduleContentRef.current.scrollTop).toBe(0);
    });

    describe("FULL DAY mode", () => {
        const days: Item[] = [
            { id: 1, day: "d1" },
            { id: 2, day: "d1" },
            { id: 3, day: "d2" },
            { id: 4, day: "d3" },
            { id: 5, day: "d3" },
        ];
        const fullDay = {
            getGroupKey: (item: Item) => item.day,
            pageSizeOverride: fullDayPageSize,
        };

        it("should treat each group as a page", () => {
            const { result } = setup(days, "page=2", fullDay);

            expect(result.current.pageSize).toBe(fullDayPageSize);
            expect(result.current.totalItems).toBe(3);
            expect(result.current.totalPages).toBe(3);
            expect(result.current.itemsOnPage.map((item) => item.id)).toEqual([3]);
            expect(result.current.groupKeys).toEqual(["d1", "d2", "d3"]);
        });

        it("should open selected group regardless of the page parameter", () => {
            const { result } = setup(days, "page=1", { ...fullDay, selectedGroupKey: "d3" });

            expect(result.current.currentPage).toBe(3);
            expect(result.current.itemsOnPage.map((item) => item.id)).toEqual([4, 5]);
        });

        it("should fall back to the page parameter for an unknown group", () => {
            const { result } = setup(days, "page=2", { ...fullDay, selectedGroupKey: "gone" });

            expect(result.current.currentPage).toBe(2);
        });
    });
});
