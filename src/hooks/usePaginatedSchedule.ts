import { useMemo } from "react";

import { defaultPageSize, fullDayPageSize, pageSizeOptions, storagePrefix } from "../configuration";
import type { PageSize } from "../schedule.types";
import { oneOf } from "../utils/storage.utils";
import { usePersistedState } from "./usePersistedState";

const pageSizeStorageKey = `${storagePrefix}:page-size`;
const parsePageSize = oneOf<PageSize>(pageSizeOptions, defaultPageSize);

const parsePage = (value: string | number | null): number => {
    const page = Number(value);
    return Number.isInteger(page) && page > 0 ? page : 1;
};

interface UsePaginatedScheduleParams<T> {
    items: T[];
    getGroupKey?: (item: T) => string;
    updatePageParams?: (params: URLSearchParams, page: number, pageSize: PageSize) => void;
    pageSizeOverride?: PageSize;
    selectedGroupKey?: string;
    searchParams: URLSearchParams;
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
    scheduleContentRef: React.RefObject<HTMLDivElement | null>;
}

export const usePaginatedSchedule = <T>({
    items,
    getGroupKey,
    updatePageParams,
    pageSizeOverride,
    selectedGroupKey,
    searchParams,
    updateSearchParams,
    scheduleContentRef,
}: UsePaginatedScheduleParams<T>) => {
    const [pageSize, setPageSize] = usePersistedState(pageSizeStorageKey, parsePageSize);

    const currentPageFromParams = parsePage(searchParams.get("page"));
    const groupKeys = useMemo(() => {
        if (!getGroupKey) {
            return [];
        }

        return [...new Set(items.map(getGroupKey))];
    }, [getGroupKey, items]);
    const effectivePageSize = pageSizeOverride ?? pageSize;
    const isFullDay = effectivePageSize === fullDayPageSize;
    const numericPageSize = isFullDay ? 1 : effectivePageSize;
    const totalItems = isFullDay ? groupKeys.length : items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / numericPageSize));
    const selectedGroupIndex = selectedGroupKey ? groupKeys.indexOf(selectedGroupKey) : -1;
    const currentPage = Math.min(
        selectedGroupIndex >= 0 ? selectedGroupIndex + 1 : currentPageFromParams,
        totalPages
    );
    const pageStartIndex = (currentPage - 1) * numericPageSize;
    const itemsOnPage = useMemo(
        () =>
            isFullDay && getGroupKey
                ? items.filter((item) => getGroupKey(item) === groupKeys[currentPage - 1])
                : items.slice(pageStartIndex, pageStartIndex + numericPageSize),
        [currentPage, getGroupKey, groupKeys, isFullDay, items, numericPageSize, pageStartIndex]
    );
    const pageStart = totalItems === 0 ? 0 : isFullDay ? currentPage : pageStartIndex + 1;
    const pageEnd = isFullDay
        ? Math.min(currentPage, totalItems)
        : Math.min(pageStartIndex + numericPageSize, totalItems);

    const goToPage = (page: number, pageSizeForParams: PageSize = effectivePageSize) => {
        updateSearchParams((nextParams) => {
            nextParams.set("page", String(page));
            nextParams.delete("date");
            updatePageParams?.(nextParams, page, pageSizeForParams);
        });

        if (scheduleContentRef.current) {
            scheduleContentRef.current.scrollTop = 0;
        }
    };

    const getPageHoldingCurrentStart = (nextPageSize: PageSize): number => {
        const firstIndex = isFullDay
            ? items.findIndex((item) => getGroupKey?.(item) === groupKeys[currentPage - 1])
            : pageStartIndex;

        if (firstIndex < 0 || firstIndex >= items.length) {
            return 1;
        }

        if (nextPageSize === fullDayPageSize) {
            return Math.max(1, groupKeys.indexOf(getGroupKey?.(items[firstIndex]) ?? "") + 1);
        }

        return Math.floor(firstIndex / nextPageSize) + 1;
    };

    const setSelectedPageSize = (value: string) => {
        const nextPageSize = value === fullDayPageSize ? fullDayPageSize : Number(value);

        if (pageSizeOptions.includes(nextPageSize as PageSize)) {
            setPageSize(nextPageSize as PageSize);
            goToPage(
                getPageHoldingCurrentStart(nextPageSize as PageSize),
                nextPageSize as PageSize
            );
        }
    };

    return {
        pageSize: effectivePageSize,
        pageSizeOptions,
        totalItems,
        totalPages,
        currentPage,
        itemsOnPage,
        groupKeys,
        pageStart,
        pageEnd,
        goToPage,
        setSelectedPageSize,
    };
};
