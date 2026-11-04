import { css, styled } from "styled-components";

import { borderWidth } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { textStyle, type FontSize } from "../../styles/typography";
import type { ButtonSize, ButtonVariant } from "./Button.component";

interface StyledButtonProps {
    $variant: ButtonVariant;
    $size: ButtonSize;
}

const textSizes: Record<ButtonSize, { padding: string; fontSize: FontSize }> = {
    s: { padding: "4px 6px", fontSize: "s" },
    m: { padding: "6px 8px", fontSize: "base" },
    l: { padding: "8px 10px", fontSize: "base" },
};

const minSizes: Record<ButtonSize, { side: string; padding: string; fontSize: FontSize }> = {
    s: { side: "24px", padding: "0 4px", fontSize: "m" },
    m: { side: "32px", padding: "0 8px", fontSize: "base" },
    l: { side: "40px", padding: "0 8px", fontSize: "l" },
};

const primaryStyles = css<StyledButtonProps>`
    padding: ${({ $size }) => textSizes[$size].padding};
    border-color: ${theme.primaryAction};
    background: ${theme.primaryAction};
    color: ${theme.textAction};
    ${({ $size }) =>
        textStyle({
            size: textSizes[$size].fontSize,
            lineHeight: "tight",
            spacing: "l",
            uppercase: true,
        })}

    &:not(:disabled):hover {
        background: ${theme.surfaceHover};
        color: ${theme.primaryAction};
    }
`;

const secondaryStyles = css<StyledButtonProps>`
    min-width: ${({ $size }) => minSizes[$size].side};
    min-height: ${({ $size }) => minSizes[$size].side};
    padding: ${({ $size }) => minSizes[$size].padding};
    border-color: ${theme.primary};
    background: transparent;
    color: ${theme.text};
    ${({ $size }) => textStyle({ size: minSizes[$size].fontSize, lineHeight: "none" })}

    &:not(:disabled):hover {
        border-color: ${theme.primaryAction};
        color: ${theme.primaryAction};
    }
`;

export const StyledButton = styled.button<StyledButtonProps>`
    display: inline-grid;
    flex: 0 0 auto;
    place-items: center;
    border: ${borderWidth.base} solid transparent;
    cursor: pointer;
    text-align: center;
    ${textStyle({ weight: "bold" })}

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }

    ${({ $variant }) => ($variant === "primary" ? primaryStyles : secondaryStyles)}
`;
