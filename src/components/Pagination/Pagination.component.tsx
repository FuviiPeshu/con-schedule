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

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    pageStart: number;
    pageEnd: number;
    totalItems: number;
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
    pageSize,
    pageSizeOptions,
    position,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) => (
    <PaginationBar aria-label={`Schedule pagination (${position})`}>
        <PaginationRange>
            Showing {pageStart}-{pageEnd} / {totalItems} items
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
                Page {currentPage} / {totalPages}
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
