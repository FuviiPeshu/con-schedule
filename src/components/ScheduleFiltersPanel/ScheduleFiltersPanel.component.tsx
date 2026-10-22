import { filterInputConfig, filterSelectConfigs } from "../../configuration";
import type { FilterOptions, ScheduleFilters } from "../../schedule.types";
import { AppliedFiltersComponent } from "../AppliedFilters";
import { FilterInputComponent, FilterSelectComponent } from "../Filters";
import {
    CollapseButton,
    CollapseIcon,
    FilterAside,
    FilterBody,
    FilterControls,
    FilterHeader,
    FilterPanelTitle,
    ResetButton,
} from "./ScheduleFiltersPanel.styled";

interface ScheduleFiltersPanelProps {
    filters: ScheduleFilters;
    filterOptions: FilterOptions;
    filtersOpen: boolean;
    hasActiveFilters: boolean;
    onToggle: () => void;
    onFilterChange: (filter: keyof ScheduleFilters, value: string) => void;
    onClear: () => void;
}

export const ScheduleFiltersPanel = ({
    filters,
    filterOptions,
    filtersOpen,
    hasActiveFilters,
    onToggle,
    onFilterChange,
    onClear,
}: ScheduleFiltersPanelProps) => (
    <FilterAside $collapsed={!filtersOpen} aria-label="Schedule filters">
        <FilterHeader $collapsed={!filtersOpen}>
            {filtersOpen && <FilterPanelTitle>Control panel</FilterPanelTitle>}
            <CollapseButton
                type="button"
                aria-label={filtersOpen ? "Collapse filters" : "Expand filters"}
                aria-expanded={filtersOpen}
                aria-controls="schedule-filters"
                title={filtersOpen ? "Collapse filters" : "Expand filters"}
                onClick={onToggle}
            >
                <CollapseIcon aria-hidden="true">{filtersOpen ? "<" : ">"}</CollapseIcon>
            </CollapseButton>
        </FilterHeader>
        {filtersOpen ? (
            <FilterBody id="schedule-filters">
                <FilterControls role="group" aria-label="Schedule filters">
                    <FilterInputComponent
                        inputType="search"
                        label={filterInputConfig.label}
                        placeholder={filterInputConfig.emptyLabel}
                        value={filters.search}
                        onChange={(value) => onFilterChange(filterInputConfig.filterKey, value)}
                    />
                    {filterSelectConfigs.map(({ label, filterKey, emptyLabel }) => (
                        <FilterSelectComponent
                            key={filterKey}
                            label={label}
                            value={filters[filterKey]}
                            options={filterOptions[filterKey]}
                            emptyLabel={emptyLabel}
                            onChange={(value) => onFilterChange(filterKey, value)}
                        />
                    ))}
                </FilterControls>
                <AppliedFiltersComponent
                    filters={filters}
                    onRemove={(filter) => onFilterChange(filter, "")}
                />
                <ResetButton type="button" disabled={!hasActiveFilters} onClick={onClear}>
                    Clear filters
                </ResetButton>
            </FilterBody>
        ) : (
            <AppliedFiltersComponent
                filters={filters}
                compact
                onRemove={(filter) => onFilterChange(filter, "")}
                onClear={onClear}
            />
        )}
    </FilterAside>
);
