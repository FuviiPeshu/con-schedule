import type { SelectHTMLAttributes } from "react";

import { StyledSelect } from "./Select.styled";

export type SelectSize = "s" | "m";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "size" | "value"
> {
    options: readonly SelectOption[];
    value: string;
    onChange: (value: string) => void;
    /** Adds leading option for no value selected */
    emptyLabel?: string;
    size?: SelectSize;
}

export const SelectComponent = ({
    options,
    value,
    onChange,
    emptyLabel,
    size = "m",
    ...props
}: SelectProps) => (
    <StyledSelect
        {...props}
        $size={size}
        value={value}
        onChange={(event) => onChange(event.target.value)}
    >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </StyledSelect>
);
