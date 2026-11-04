import type { InputHTMLAttributes } from "react";

import { CheckboxInput, CheckboxLabel } from "./Checkbox.styled";

export interface CheckboxProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
> {
    label: string;
    onChange: (checked: boolean) => void;
}

export const CheckboxComponent = ({ label, onChange, ...props }: CheckboxProps) => (
    <CheckboxLabel>
        <CheckboxInput
            {...props}
            type="checkbox"
            onChange={(event) => onChange(event.target.checked)}
        />
        {label}
    </CheckboxLabel>
);
