import { SegmentedButton, SegmentedGroup } from "./SegmentedButtonGroup.styled";

export interface SegmentedButtonOption<T extends string> {
    value: T;
    label: string;
}

export interface SegmentedButtonGroupProps<T extends string> {
    options: readonly SegmentedButtonOption<T>[];
    value: T;
    onChange: (value: T) => void;
    "aria-label": string;
}

export const SegmentedButtonGroupComponent = <T extends string>({
    options,
    value,
    onChange,
    "aria-label": ariaLabel,
}: SegmentedButtonGroupProps<T>) => (
    <SegmentedGroup role="group" aria-label={ariaLabel}>
        {options.map((option) => (
            <SegmentedButton
                key={option.value}
                type="button"
                $active={value === option.value}
                aria-pressed={value === option.value}
                onClick={() => onChange(option.value)}
            >
                {option.label}
            </SegmentedButton>
        ))}
    </SegmentedGroup>
);
