import { filterInputConfig, filterSelectConfigs } from "../../configuration";
import type {
    FilterOptions,
    ListDisplayMode,
    ScheduleFilters,
    ScheduleView,
} from "../../schedule.types";
import { AppliedFiltersComponent } from "../AppliedFilters";
import { InputComponent } from "../Input";
import { ScheduleViewControlsComponent } from "../ScheduleViewControls";
import { SelectComponent } from "../Select";
import {
    CollapseButton,
    CollapseIcon,
    FilterAside,
    FilterBody,
    FilterControls,
    FilterHeader,
    FilterLabel,
    FilterPanelTitle,
    ResetButton,
} from "./ScheduleFiltersPanel.styled";

interface ScheduleFiltersPanelProps {
    filters: ScheduleFilters;
    filterOptions: FilterOptions;
    filtersOpen: boolean;
    hasActiveFilters: boolean;
    view: ScheduleView;
    onViewChange: (view: ScheduleView) => void;
    listDisplayMode: ListDisplayMode;
    onListDisplayModeChange: (mode: ListDisplayMode) => void;
    onToggle: () => void;
    onFilterChange: (filter: keyof ScheduleFilters, value: string) => void;
    onClear: () => void;
}

export const ScheduleFiltersPanel = ({
    filters,
    filterOptions,
    filtersOpen,
    hasActiveFilters,
    view,
    onViewChange,
    listDisplayMode,
    onListDisplayModeChange,
    onToggle,
    onFilterChange,
    onClear,
}: ScheduleFiltersPanelProps) => (
    <FilterAside $collapsed={!filtersOpen} aria-label="Schedule filters">
        <FilterHeader $collapsed={!filtersOpen}>
            {filtersOpen && <FilterPanelTitle>Control panel</FilterPanelTitle>}
            <CollapseButton
                variant="secondary"
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
                <ScheduleViewControlsComponent
                    view={view}
                    onViewChange={onViewChange}
                    listDisplayMode={listDisplayMode}
                    onListDisplayModeChange={onListDisplayModeChange}
                />
                <FilterControls role="group" aria-label="Schedule filters">
                    <FilterLabel>
                        {filterInputConfig.label}
                        <InputComponent
                            type="search"
                            aria-label={filterInputConfig.emptyLabel}
                            placeholder={filterInputConfig.emptyLabel}
                            value={filters[filterInputConfig.filterKey]}
                            onChange={(value) => onFilterChange(filterInputConfig.filterKey, value)}
                        />
                    </FilterLabel>
                    {filterSelectConfigs.map(({ label, filterKey, emptyLabel }) => (
                        <FilterLabel key={filterKey}>
                            {label}
                            <SelectComponent
                                size="m"
                                aria-label={`Filter by ${label.toLocaleLowerCase()}`}
                                value={filters[filterKey]}
                                options={filterOptions[filterKey]}
                                emptyLabel={emptyLabel}
                                onChange={(value) => onFilterChange(filterKey, value)}
                            />
                        </FilterLabel>
                    ))}
                </FilterControls>
                <AppliedFiltersComponent
                    filters={filters}
                    filterOptions={filterOptions}
                    onRemove={(filter) => onFilterChange(filter, "")}
                />
                <ResetButton variant="primary" disabled={!hasActiveFilters} onClick={onClear}>
                    Clear filters
                </ResetButton>
            </FilterBody>
        ) : (
            <AppliedFiltersComponent
                filters={filters}
                filterOptions={filterOptions}
                compact
                onRemove={(filter) => onFilterChange(filter, "")}
                onClear={onClear}
            />
        )}
    </FilterAside>
);
