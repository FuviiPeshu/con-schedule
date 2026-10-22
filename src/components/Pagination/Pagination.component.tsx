import { fullDayPageSize } from "../../configuration";
import type { PageSize } from "../../schedule.types";
import {
    PageSizeControl,
    PageSizeLabel,
    PageSizeSelect,
    PaginationBar,
    PaginationButton,
    PaginationControls,
    PaginationRange,
    PaginationStatus,
} from "./Pagination.styled";

const formatPaginationNumber = (value: number, maximum: number): string =>
    String(value).padStart(String(maximum).length, "0");

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageStart: number;
    pageEnd: number;
    totalItems: number;
    itemLabel?: string;
    /** Optional text override for the pagination range (left section) */
    rangeText?: string;
    /** Optional text override for the pagination status (middle section) */
    statusText?: string;
    /** Optional minimum character width for the status to avoid layout shifts */
    statusMinWidth?: number;
    pageSize: PageSize;
    pageSizeOptions: readonly PageSize[];
    position: "top" | "bottom";
    onPageChange: (page: number) => void;
    onPageSizeChange: (value: string) => void;
}

export const PaginationComponent = ({
    currentPage,
    totalPages,
    pageStart,
    pageEnd,
    totalItems,
    itemLabel = "items",
    rangeText,
    statusText,
    statusMinWidth,
    pageSize,
    pageSizeOptions,
    position,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) => (
    <PaginationBar aria-label={`Schedule pagination (${position})`}>
        <PaginationRange>
            {rangeText ?? (
                <>
                    Showing {formatPaginationNumber(pageStart, totalItems)}-
                    {formatPaginationNumber(pageEnd, totalItems)} / {totalItems} {itemLabel}
                </>
            )}
        </PaginationRange>
        <PaginationControls>
            <PaginationButton
                type="button"
                aria-label={`Previous page (${position})`}
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
                &lt;
            </PaginationButton>
            <PaginationStatus $minWidth={statusMinWidth}>
                {statusText ??
                    `Page ${formatPaginationNumber(currentPage, totalPages)} / ${totalPages}`}
            </PaginationStatus>
            <PaginationButton
                type="button"
                aria-label={`Next page (${position})`}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            >
                &gt;
            </PaginationButton>
        </PaginationControls>
        <PageSizeControl>
            <PageSizeLabel>Page size:</PageSizeLabel>
            <PageSizeSelect
                aria-label={`Page size (${position})`}
                value={pageSize}
                onChange={(event) => onPageSizeChange(event.target.value)}
            >
                {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                        {option === fullDayPageSize ? "FULL DAY" : option}
                    </option>
                ))}
            </PageSizeSelect>
        </PageSizeControl>
    </PaginationBar>
);
