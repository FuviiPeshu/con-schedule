import { FilterInput, FilterLabel } from "./Filters.styled";

export interface FilterInputComponentProps {
    label: string;
    value: string;
    placeholder?: string;
    inputType?: React.HTMLInputTypeAttribute;
    onChange: (value: string) => void;
}

export const FilterInputComponent = ({
    label,
    value,
    placeholder,
    inputType,
    onChange,
}: FilterInputComponentProps) => (
    <FilterLabel>
        {label}
        <FilterInput
            type={inputType}
            aria-label={placeholder}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    </FilterLabel>
);
