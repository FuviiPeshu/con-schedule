import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PaginationComponent } from "./Pagination.component";

describe("Components / Pagination", () => {
    it("should adjust range and page numbers with leading zeros to their maximum width", () => {
        render(
            <PaginationComponent
                currentPage={2}
                totalPages={12}
                pageStart={11}
                pageEnd={20}
                totalItems={100}
                pageSize={10}
                pageSizeOptions={[5, 10, 20]}
                position="top"
                onPageChange={vi.fn()}
                onPageSizeChange={vi.fn()}
            />
        );

        expect(screen.getByText("Showing 011-020 / 100 items")).toBeInTheDocument();
        expect(screen.getByText("Page 02 / 12")).toBeInTheDocument();
    });
});
