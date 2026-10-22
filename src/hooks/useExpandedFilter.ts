import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, MouseEvent } from "react";

import type { FilterKey } from "../schedule.types";
import { containsNode } from "../utils/dom.utils";

const collapseDelayMs = 500; // how long the expanded chip stays visible once the pointer/focus has left it

interface UseExpandedFilterParams {
    /** Chips only expand in the compact layout */
    enabled: boolean;
    activeFilters: ReadonlyArray<{ filterKey: FilterKey }>;
}

/** Tracks which compact filter chip is expanded and fades it out shortly after hover/focus leaves */
export const useExpandedFilter = ({ enabled, activeFilters }: UseExpandedFilterParams) => {
    const [expandedFilter, setExpandedFilter] = useState<FilterKey | null>(null);
    const [fadingFilter, setFadingFilter] = useState<FilterKey | null>(null);

    const collapseTimerRef = useRef<number | null>(null);

    const clearCollapseTimer = useCallback(() => {
        if (collapseTimerRef.current !== null) {
            window.clearTimeout(collapseTimerRef.current);
            collapseTimerRef.current = null;
        }
    }, []);

    const collapse = useCallback(() => {
        clearCollapseTimer();
        setExpandedFilter(null);
        setFadingFilter(null);
    }, [clearCollapseTimer]);

    const expandFilter = (filterKey: FilterKey) => {
        clearCollapseTimer();
        setExpandedFilter(filterKey);
        setFadingFilter(null);
    };

    const keepExpanded = (filterKey: FilterKey) => {
        if (expandedFilter !== filterKey) {
            return;
        }

        clearCollapseTimer();
        setFadingFilter(null);
    };

    const beginCollapse = (filterKey: FilterKey) => {
        if (expandedFilter !== filterKey) {
            return;
        }

        clearCollapseTimer();
        setFadingFilter(filterKey);
        collapseTimerRef.current = window.setTimeout(() => {
            setExpandedFilter((currentFilter) =>
                currentFilter === filterKey ? null : currentFilter
            );
            setFadingFilter((currentFilter) =>
                currentFilter === filterKey ? null : currentFilter
            );
            collapseTimerRef.current = null;
        }, collapseDelayMs);
    };

    const handleMouseLeave = (filterKey: FilterKey, event: MouseEvent<HTMLElement>) => {
        const isFocused = event.currentTarget.contains(document.activeElement);

        if (!isFocused && !containsNode(event.currentTarget, event.relatedTarget)) {
            beginCollapse(filterKey);
        }
    };

    const handleBlur = (filterKey: FilterKey, event: FocusEvent<HTMLElement>) => {
        const isHoveredOn = event.currentTarget.matches(":hover");

        if (!isHoveredOn && !containsNode(event.currentTarget, event.relatedTarget)) {
            beginCollapse(filterKey);
        }
    };

    useEffect(() => {
        const isExpandedFilterGone =
            expandedFilter !== null &&
            !activeFilters.some((filter) => filter.filterKey === expandedFilter);

        if (!enabled || isExpandedFilterGone) {
            collapse();
        }
    }, [activeFilters, collapse, enabled, expandedFilter]);

    useEffect(() => clearCollapseTimer, [clearCollapseTimer]);

    return {
        expandedFilter,
        fadingFilter,
        expandFilter,
        keepExpanded,
        handleMouseLeave,
        handleBlur,
        collapse,
    };
};
