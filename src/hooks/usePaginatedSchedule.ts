import { useEffect, useMemo, useState } from "react";

import { defaultPageSize, fullDayPageSize, pageSizeOptions, storagePrefix } from "../configuration";
import type { PageSize } from "../schedule.types";
import { readStoredValue, writeStoredValue } from "../utils/storage.utils";

const pageSizeStorageKey = `${storagePrefix}:page-size`;

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
    const [pageSize, setPageSize] = useState<PageSize>(() => {
        const storedPageSize = readStoredValue<unknown>(pageSizeStorageKey, defaultPageSize);

        return pageSizeOptions.includes(storedPageSize as PageSize)
            ? (storedPageSize as PageSize)
            : defaultPageSize;
    });

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

    useEffect(() => {
        writeStoredValue(pageSizeStorageKey, pageSize);
    }, [pageSize]);

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

    const setSelectedPageSize = (value: string) => {
        if (value === fullDayPageSize) {
            setPageSize(fullDayPageSize);
            goToPage(1, fullDayPageSize);
            return;
        }

        const nextPageSize = Number(value);

        if (pageSizeOptions.includes(nextPageSize as PageSize)) {
            setPageSize(nextPageSize as PageSize);
            goToPage(1, nextPageSize as PageSize);
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
