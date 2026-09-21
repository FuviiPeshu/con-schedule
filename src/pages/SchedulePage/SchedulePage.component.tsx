import { useMemo, useState } from "react";

import { EventCard } from "../../components/EventCard/EventCard.component";
import { FilterInputComponent, FilterSelectComponent } from "../../components/Filters";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useSchedule } from "../../hooks/useSchedule";
import type { ScheduleFilters, SelectFilterKey } from "../../schedule.types";
import {
    emptyFilters,
    eventMatchesFilters,
    getFilterOptions,
} from "../../utils/scheduleFilters.utils";
import {
    ErrorBanner,
    EventList,
    FilterControls,
    ResetButton,
    ResultCount,
    StatusText,
} from "./SchedulePage.styled";

const searchDebounceMs = 128;
const filterInputConfig = {
    label: "Search",
    filterKey: "search" as keyof ScheduleFilters,
    placeholder: "Search events",
};
const filterSelectConfigs: {
    label: string;
    filterKey: SelectFilterKey;
    emptyLabel: string;
}[] = [
    { label: "Room", filterKey: "room", emptyLabel: "All rooms" },
    { label: "Date", filterKey: "date", emptyLabel: "All dates" },
    { label: "Tag", filterKey: "tag", emptyLabel: "All tags" },
    { label: "Speaker", filterKey: "speaker", emptyLabel: "All speakers" },
];

export const SchedulePage = () => {
    const [filters, setFilters] = useState<ScheduleFilters>(emptyFilters);

    const { data, isLoading, isError } = useSchedule();
    const events = data?.events ?? [];
    const hasActiveFilters = Object.values(filters).some(Boolean);
    const filterOptions = useMemo(() => getFilterOptions(events), [events]);
    const debouncedSearch = useDebouncedValue(filters.search, searchDebounceMs);
    const searchForFiltering = filters.search ? debouncedSearch : "";
    const appliedFilters = useMemo(
        () => ({ ...filters, search: searchForFiltering }),
        [filters.room, filters.date, filters.tag, filters.speaker, searchForFiltering]
    );
    const filteredEvents = useMemo(
        () => events.filter((event) => eventMatchesFilters(event, appliedFilters)),
        [events, appliedFilters]
    );

    const setFilterValue = (filter: keyof ScheduleFilters, value: string) => {
        setFilters((currentFilters) => ({ ...currentFilters, [filter]: value }));
    };

    return isLoading ? (
        <StatusText>Loading schedule...</StatusText>
    ) : !data ? (
        <StatusText>No schedule data available.</StatusText>
    ) : (
        <>
            {isError && <ErrorBanner>Showing mock data.</ErrorBanner>}
            <FilterControls role="group" aria-label="Schedule filters">
                <FilterInputComponent
                    inputType="search"
                    label={filterInputConfig.label}
                    placeholder={filterInputConfig.placeholder}
                    value={filters.search}
                    onChange={(value) => setFilterValue(filterInputConfig.filterKey, value)}
                />
                {filterSelectConfigs.map(({ label, filterKey, emptyLabel }) => (
                    <FilterSelectComponent
                        key={filterKey}
                        label={label}
                        value={filters[filterKey]}
                        options={filterOptions[filterKey]}
                        emptyLabel={emptyLabel}
                        onChange={(value) => setFilterValue(filterKey, value)}
                    />
                ))}
                <ResetButton
                    type="button"
                    disabled={!hasActiveFilters}
                    onClick={() => setFilters(emptyFilters)}
                >
                    Clear filters
                </ResetButton>
            </FilterControls>
            <ResultCount aria-live="polite">
                {filteredEvents.length} of {events.length} events
            </ResultCount>
            <EventList>
                {events.length === 0 && <StatusText>No events found.</StatusText>}
                {events.length > 0 && filteredEvents.length === 0 && (
                    <StatusText>No events match the current filters.</StatusText>
                )}
                {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </EventList>
        </>
    );
};
