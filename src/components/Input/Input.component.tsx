import type { InputHTMLAttributes } from "react";

import { StyledInput } from "./Input.styled";

export type InputSize = "s" | "m" | "l";

export interface InputProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value" | "size"
> {
    value: string;
    onChange: (value: string) => void;
    size?: InputSize;
}

export const InputComponent = ({ onChange, size = "m", ...props }: InputProps) => (
    <StyledInput {...props} onChange={(event) => onChange(event.target.value)} $size={size} />
);
