import { useEffect, useMemo, useState } from "react";

import { defaultPageSize, pageSizeOptions, storagePrefix } from "../configuration";
import type { PageSize } from "../schedule.types";
import { readStoredValue, writeStoredValue } from "../utils/storage.utils";

const pageSizeStorageKey = `${storagePrefix}:page-size`;

const parsePage = (value: string | number | null): number => {
    const page = Number(value);
    return Number.isInteger(page) && page > 0 ? page : 1;
};

interface UsePaginatedScheduleParams<T> {
    items: T[];
    searchParams: URLSearchParams;
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
    scheduleContentRef: React.RefObject<HTMLDivElement | null>;
}

export const usePaginatedSchedule = <T>({
    items,
    searchParams,
    updateSearchParams,
    scheduleContentRef,
}: UsePaginatedScheduleParams<T>) => {
    const [pageSize, setPageSize] = useState<PageSize>(() => {
        const storedPageSize = readStoredValue<number>(pageSizeStorageKey, defaultPageSize);

        return pageSizeOptions.includes(storedPageSize as PageSize)
            ? (storedPageSize as PageSize)
            : defaultPageSize;
    });

    const currentPageFromParams = parsePage(searchParams.get("page"));
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(currentPageFromParams, totalPages);
    const pageStartIndex = (currentPage - 1) * pageSize;
    const itemsOnPage = useMemo(
        () => items.slice(pageStartIndex, pageStartIndex + pageSize),
        [items, pageSize, pageStartIndex]
    );
    const pageStart = totalItems === 0 ? 0 : pageStartIndex + 1;
    const pageEnd = Math.min(pageStartIndex + pageSize, totalItems);

    useEffect(() => {
        writeStoredValue(pageSizeStorageKey, pageSize);
    }, [pageSize]);

    const goToPage = (page: number) => {
        updateSearchParams((nextParams) => {
            nextParams.set("page", String(page));
            nextParams.delete("date");
        });

        if (scheduleContentRef.current) {
            scheduleContentRef.current.scrollTop = 0;
        }
    };

    const setSelectedPageSize = (value: string) => {
        const nextPageSize = Number(value);

        if (pageSizeOptions.includes(nextPageSize as PageSize)) {
            setPageSize(nextPageSize as PageSize);
            goToPage(1);
        }
    };

    return {
        pageSize,
        pageSizeOptions,
        totalItems,
        totalPages,
        currentPage,
        itemsOnPage,
        pageStart,
        pageEnd,
        goToPage,
        setSelectedPageSize,
    };
};
