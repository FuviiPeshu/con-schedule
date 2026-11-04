import type { ButtonHTMLAttributes } from "react";

import { StyledButton } from "./Button.styled";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "s" | "m" | "l";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant: ButtonVariant;
    size?: ButtonSize;
}

export const ButtonComponent = ({
    variant,
    size = "m",
    type = "button",
    ...props
}: ButtonProps) => <StyledButton {...props} type={type} $variant={variant} $size={size} />;
