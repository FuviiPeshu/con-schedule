import { fullDayPageSize } from "../../configuration";
import type { PageSize } from "../../schedule.types";
import { padNumber } from "../../utils/text.utils";
import { ButtonComponent } from "../Button";
import { PagePickerComponent } from "../PagePicker";
import { SelectComponent } from "../Select";
import {
    PageSizeControl,
    PageSizeLabel,
    PaginationBar,
    PaginationControls,
    PaginationRange,
} from "./Pagination.styled";

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
    /** Optional description per page (index 0 = page 1) shown in the page picker */
    pageLabels?: readonly string[];
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
    pageLabels,
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
                    Showing {padNumber(pageStart, totalItems)}-{padNumber(pageEnd, totalItems)} /{" "}
                    {totalItems} {itemLabel}
                </>
            )}
        </PaginationRange>
        <PaginationControls>
            <ButtonComponent
                variant="secondary"
                aria-label={`Previous page (${position})`}
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
                &lt;
            </ButtonComponent>
            <PagePickerComponent
                currentPage={currentPage}
                totalPages={totalPages}
                statusText={
                    statusText ?? `Page ${padNumber(currentPage, totalPages)} / ${totalPages}`
                }
                statusMinWidth={statusMinWidth}
                pageLabels={pageLabels}
                position={position}
                onPageChange={onPageChange}
            />
            <ButtonComponent
                variant="secondary"
                aria-label={`Next page (${position})`}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            >
                &gt;
            </ButtonComponent>
        </PaginationControls>
        <PageSizeControl>
            <PageSizeLabel>Page size:</PageSizeLabel>
            <SelectComponent
                size="s"
                aria-label={`Page size (${position})`}
                value={String(pageSize)}
                options={pageSizeOptions.map((option) => ({
                    value: String(option),
                    label: option === fullDayPageSize ? "FULL DAY" : String(option),
                }))}
                onChange={onPageSizeChange}
            />
        </PageSizeControl>
    </PaginationBar>
);
