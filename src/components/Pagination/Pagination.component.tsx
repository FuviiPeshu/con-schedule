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

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    pageStart: number;
    pageEnd: number;
    totalItems: number;
    itemLabel?: string;
    pageSize: number;
    pageSizeOptions: readonly number[];
    position: "top" | "bottom";
    onPageChange: (page: number) => void;
    onPageSizeChange: (value: string) => void;
};

export const PaginationComponent = ({
    currentPage,
    totalPages,
    pageStart,
    pageEnd,
    totalItems,
    itemLabel = "items",
    pageSize,
    pageSizeOptions,
    position,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) => (
    <PaginationBar aria-label={`Schedule pagination (${position})`}>
        <PaginationRange>
            Showing {formatPaginationNumber(pageStart, totalItems)}-
            {formatPaginationNumber(pageEnd, totalItems)} / {totalItems} {itemLabel}
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
            <PaginationStatus>
                Page {formatPaginationNumber(currentPage, totalPages)} / {totalPages}
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
                        {option}
                    </option>
                ))}
            </PageSizeSelect>
        </PageSizeControl>
    </PaginationBar>
);
