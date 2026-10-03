import { useEffect, useMemo, useRef, useState, type FocusEvent, type MouseEvent } from "react";

import { appliedFilterConfigs } from "../../configuration";
import type { ScheduleFilters } from "../../schedule.types";
import { containsNode } from "../../utils/dom.utils";
import {
    AppliedFilterCompact,
    AppliedFiltersClear,
    AppliedFiltersEmpty,
    AppliedFiltersLabel,
    AppliedFiltersList,
    AppliedFiltersRemove,
    AppliedFiltersValue,
    AppliedFiltersWrapper,
    AppliedFilterWrapper,
    AppliedFilterWrapperHeader,
    ExpandedAppliedFilter,
    ExpandedAppliedFilterAction,
    ExpandedAppliedFilterActions,
    ExpandedAppliedFilterLabel,
    ExpandedAppliedFilterValue,
    ExpandedAppliedFilterWrapper,
} from "./AppliedFilters.styled";

interface AppliedFiltersProps {
    filters: ScheduleFilters;
    onRemove: (filter: keyof ScheduleFilters) => void;
    onClear?: () => void;
    compact?: boolean;
}

export const AppliedFiltersComponent = ({
    filters,
    onRemove,
    onClear,
    compact = false,
}: AppliedFiltersProps) => {
    const [expandedFilter, setExpandedFilter] = useState<keyof ScheduleFilters | null>(null);
    const [fadingFilter, setFadingFilter] = useState<keyof ScheduleFilters | null>(null);

    const collapseTimerRef = useRef<number | null>(null);
    const appliedFilters = useMemo(
        () =>
            appliedFilterConfigs.flatMap(({ filterKey, label }) => {
                const value = filters[filterKey];
                return value ? [{ filterKey, label, value }] : [];
            }),
        [filters]
    );

    const clearCollapseTimer = () => {
        if (collapseTimerRef.current !== null) {
            window.clearTimeout(collapseTimerRef.current);
            collapseTimerRef.current = null;
        }
    };

    const expandFilter = (filterKey: keyof ScheduleFilters) => {
        clearCollapseTimer();
        setExpandedFilter(filterKey);
        setFadingFilter(null);
    };

    const beginCollapse = (filterKey: keyof ScheduleFilters) => {
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
        }, 500);
    };

    const keepExpanded = (filterKey: keyof ScheduleFilters) => {
        if (expandedFilter !== filterKey) {
            return;
        }

        clearCollapseTimer();
        setFadingFilter(null);
    };

    const handleMouseLeave = (filterKey: keyof ScheduleFilters, event: MouseEvent<HTMLElement>) => {
        const isFocused = event.currentTarget.contains(document.activeElement);
        if (isFocused || containsNode(event.currentTarget, event.relatedTarget)) {
            return;
        }

        beginCollapse(filterKey);
    };

    const handleBlur = (filterKey: keyof ScheduleFilters, event: FocusEvent<HTMLElement>) => {
        const isHoveredOn = event.currentTarget.matches(":hover");
        if (isHoveredOn || containsNode(event.currentTarget, event.relatedTarget)) {
            return;
        }

        beginCollapse(filterKey);
    };

    const handleRemove = (filterKey: keyof ScheduleFilters) => {
        clearCollapseTimer();
        setExpandedFilter(null);
        setFadingFilter(null);
        onRemove(filterKey);
    };

    const handleClear = () => {
        clearCollapseTimer();
        setExpandedFilter(null);
        setFadingFilter(null);
        onClear?.();
    };

    useEffect(() => {
        if (
            !compact ||
            (expandedFilter !== null &&
                !appliedFilters.some((entry) => entry.filterKey === expandedFilter))
        ) {
            clearCollapseTimer();
            setExpandedFilter(null);
            setFadingFilter(null);
        }
    }, [compact, appliedFilters, expandedFilter]);

    useEffect(() => {
        return () => {
            if (collapseTimerRef.current !== null) {
                window.clearTimeout(collapseTimerRef.current);
            }
        };
    }, []);

    return compact && appliedFilters.length === 0 ? null : (
        <AppliedFiltersWrapper
            $compact={compact}
            role="group"
            aria-label="Applied filters"
            aria-live="polite"
        >
            <AppliedFiltersLabel $compact={compact}>
                {compact ? `Filters (${appliedFilters.length})` : "Applied filters"}
            </AppliedFiltersLabel>
            {appliedFilters.length > 0 ? (
                <AppliedFiltersList $compact={compact}>
                    {appliedFilters.map(({ filterKey, label, value }) => (
                        <AppliedFilterWrapper
                            key={filterKey}
                            $compact={compact}
                            onMouseEnter={compact ? () => keepExpanded(filterKey) : undefined}
                            onMouseLeave={
                                compact ? (event) => handleMouseLeave(filterKey, event) : undefined
                            }
                            title={!compact ? `${label}: ${value}` : undefined}
                        >
                            {compact ? (
                                <>
                                    <AppliedFilterCompact
                                        type="button"
                                        aria-label={`Expand ${label.toLowerCase()} filter`}
                                        aria-expanded={expandedFilter === filterKey}
                                        title={`${label}: ${value}`}
                                        onMouseEnter={() => {
                                            if (expandedFilter === filterKey) {
                                                keepExpanded(filterKey);
                                            } else {
                                                expandFilter(filterKey);
                                            }
                                        }}
                                        onClick={(event) => {
                                            event.currentTarget.blur();
                                            expandFilter(filterKey);
                                        }}
                                    >
                                        <span>{label}</span>
                                    </AppliedFilterCompact>
                                    {expandedFilter === filterKey && (
                                        <ExpandedAppliedFilterWrapper
                                            $visible={fadingFilter !== filterKey}
                                            role="group"
                                            aria-label={`${label} filter details`}
                                            onMouseEnter={() => keepExpanded(filterKey)}
                                            onMouseLeave={(event) =>
                                                handleMouseLeave(filterKey, event)
                                            }
                                            onFocus={() => keepExpanded(filterKey)}
                                            onBlur={(event) => handleBlur(filterKey, event)}
                                        >
                                            <ExpandedAppliedFilter>
                                                <ExpandedAppliedFilterLabel>
                                                    {label}
                                                </ExpandedAppliedFilterLabel>
                                                <ExpandedAppliedFilterValue title={value}>
                                                    {value}
                                                </ExpandedAppliedFilterValue>
                                            </ExpandedAppliedFilter>
                                            <ExpandedAppliedFilterActions>
                                                <ExpandedAppliedFilterAction
                                                    type="button"
                                                    aria-label={`Remove ${label.toLowerCase()} filter`}
                                                    title={`Remove ${label.toLowerCase()} filter`}
                                                    onClick={() => handleRemove(filterKey)}
                                                >
                                                    x
                                                </ExpandedAppliedFilterAction>
                                            </ExpandedAppliedFilterActions>
                                        </ExpandedAppliedFilterWrapper>
                                    )}
                                </>
                            ) : (
                                <>
                                    <AppliedFilterWrapperHeader>
                                        <span>{label}</span>
                                        <AppliedFiltersRemove
                                            type="button"
                                            aria-label={`Remove ${label.toLowerCase()} filter`}
                                            title={`Remove ${label.toLowerCase()} filter`}
                                            onClick={() => onRemove(filterKey)}
                                        >
                                            x
                                        </AppliedFiltersRemove>
                                    </AppliedFilterWrapperHeader>
                                    <AppliedFiltersValue title={value}>{value}</AppliedFiltersValue>
                                </>
                            )}
                        </AppliedFilterWrapper>
                    ))}
                </AppliedFiltersList>
            ) : (
                <AppliedFiltersEmpty>// NO FILTERS APPLIED</AppliedFiltersEmpty>
            )}
            {compact && onClear && (
                <AppliedFiltersClear
                    type="button"
                    aria-label="Clear all filters"
                    title="Clear all filters"
                    onClick={handleClear}
                >
                    DEL
                </AppliedFiltersClear>
            )}
        </AppliedFiltersWrapper>
    );
};
