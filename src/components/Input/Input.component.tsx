import type { InputHTMLAttributes } from "react";

import { StyledInput } from "./Input.styled";

export interface InputProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> {
    value: string;
    onChange: (value: string) => void;
}

export const InputComponent = ({ onChange, ...props }: InputProps) => (
    <StyledInput {...props} onChange={(event) => onChange(event.target.value)} />
);
