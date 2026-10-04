import { useEffect, useMemo, useState } from "react";

import type { EventSlot } from "../api";
import { defaultPageSize, pageSizeOptions, storagePrefix } from "../configuration";
import type { PageSize } from "../schedule.types";
import { readStoredValue, writeStoredValue } from "../utils/storage.utils";

const pageSizeStorageKey = `${storagePrefix}:page-size`;

const parsePage = (value: string | number | null): number => {
    const page = Number(value);
    return Number.isInteger(page) && page > 0 ? page : 1;
};

interface UsePaginatedScheduleParams {
    events: EventSlot[];
    searchParams: URLSearchParams;
    updateSearchParams: (update: (params: URLSearchParams) => void) => void;
    scheduleContentRef: React.RefObject<HTMLDivElement | null>;
}

export const usePaginatedSchedule = ({
    events,
    searchParams,
    updateSearchParams,
    scheduleContentRef,
}: UsePaginatedScheduleParams) => {
    const [pageSize, setPageSize] = useState<PageSize>(() => {
        const storedPageSize = readStoredValue<number>(pageSizeStorageKey, defaultPageSize);

        return pageSizeOptions.includes(storedPageSize as PageSize)
            ? (storedPageSize as PageSize)
            : defaultPageSize;
    });

    const currentPageFromParams = parsePage(searchParams.get("page"));
    const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
    const currentPage = Math.min(currentPageFromParams, totalPages);
    const pageStartIndex = (currentPage - 1) * pageSize;
    const eventsOnPage = useMemo(
        () => events.slice(pageStartIndex, pageStartIndex + pageSize),
        [events, pageSize, pageStartIndex]
    );
    const pageStart = events.length === 0 ? 0 : pageStartIndex + 1;
    const pageEnd = Math.min(pageStartIndex + pageSize, events.length);

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
        totalPages,
        currentPage,
        eventsOnPage,
        pageStart,
        pageEnd,
        goToPage,
        setSelectedPageSize,
    };
};
