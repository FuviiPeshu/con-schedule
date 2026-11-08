import { useEffect, useMemo, useRef, useState } from "react";

import { normalizeText, padNumber } from "../../utils/text.utils";
import { InputComponent } from "../Input";
import { PopoverComponent } from "../Popover";
import {
    PagePickerEmpty,
    PagePickerItem,
    PagePickerList,
    PagePickerStatus,
    PagePickerTrigger,
} from "./PagePicker.styled";

export interface PagePickerProps {
    currentPage: number;
    totalPages: number;
    statusText: string;
    statusMinWidth?: number;
    pageLabels?: readonly string[];
    position: "top" | "bottom";
    onPageChange: (page: number) => void;
}

interface PageOption {
    page: number;
    text: string;
    label?: string;
}

export const PagePickerComponent = ({
    currentPage,
    totalPages,
    statusText,
    statusMinWidth,
    pageLabels,
    position,
    onPageChange,
}: PagePickerProps) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (open) {
            listRef.current
                ?.querySelector('[aria-current="page"]')
                ?.scrollIntoView?.({ block: "nearest" });
        }
    }, [open]);

    const normalizedQuery = normalizeText(query);
    const matchingPages: PageOption[] = useMemo(
        () =>
            Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const label = pageLabels?.[index];

                return {
                    page,
                    label,
                    text: label ?? `Page ${padNumber(page, totalPages)}`,
                };
            }).filter(
                ({ page, label }) =>
                    !normalizedQuery ||
                    String(page).includes(normalizedQuery) ||
                    (label !== undefined && normalizeText(label).includes(normalizedQuery))
            ),
        [totalPages, pageLabels, normalizedQuery]
    );

    const handleClose = () => {
        setOpen(false);
        setQuery("");
    };

    const selectPage = (page: number) => {
        handleClose();
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const typedPage = Number(normalizedQuery);
        const isExactPage =
            /^\d+$/.test(normalizedQuery) && typedPage >= 1 && typedPage <= totalPages;
        const target = isExactPage ? typedPage : matchingPages[0]?.page;

        if (normalizedQuery && target !== undefined) {
            selectPage(target);
        }
    };

    return totalPages <= 1 ? (
        <PagePickerStatus $minWidth={statusMinWidth}>{statusText}</PagePickerStatus>
    ) : (
        <PopoverComponent
            open={open}
            onClose={handleClose}
            label={`Select page (${position})`}
            placement={position === "bottom" ? "above" : "below"}
            trigger={
                <PagePickerTrigger
                    type="button"
                    aria-label={`Select page (${position})`}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    $minWidth={statusMinWidth}
                    onClick={() => (open ? handleClose() : setOpen(true))}
                >
                    {statusText}
                </PagePickerTrigger>
            }
        >
            <form onSubmit={handleSubmit}>
                <InputComponent
                    id="page-search"
                    type="search"
                    size="s"
                    aria-label="Search page"
                    placeholder="Search page"
                    autoComplete="off"
                    value={query}
                    onChange={setQuery}
                />
            </form>
            {matchingPages.length === 0 ? (
                <PagePickerEmpty>No matching pages.</PagePickerEmpty>
            ) : (
                <PagePickerList ref={listRef}>
                    {matchingPages.map(({ page, text }) => (
                        <li key={page}>
                            <PagePickerItem
                                type="button"
                                aria-current={page === currentPage ? "page" : undefined}
                                onClick={() => selectPage(page)}
                            >
                                {text}
                            </PagePickerItem>
                        </li>
                    ))}
                </PagePickerList>
            )}
        </PopoverComponent>
    );
};
