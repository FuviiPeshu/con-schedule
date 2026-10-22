import type { FilterOption } from "../../schedule.types";
import { FilterLabel, FilterSelect } from "./Filters.styled";

export interface FilterSelectComponentProps {
    label: string;
    value: string;
    options: FilterOption[];
    emptyLabel: string;
    onChange: (value: string) => void;
}

export const FilterSelectComponent = ({
    label,
    options,
    emptyLabel,
    value,
    onChange,
}: FilterSelectComponentProps) => (
    <FilterLabel>
        {label}
        <FilterSelect
            aria-label={`Filter by ${label.toLocaleLowerCase()}`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            <option value="">{emptyLabel}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </FilterSelect>
    </FilterLabel>
);
