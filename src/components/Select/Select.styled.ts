import { css, styled } from "styled-components";

import { field } from "../../styles/mixins";
import { borderWidth } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { fontSize } from "../../styles/typography";
import type { SelectSize } from "./Select.component";

const sizeStyles: Record<SelectSize, ReturnType<typeof css>> = {
    m: field,
    s: css`
        min-height: 32px;
        padding: 2px 4px;
        border: ${borderWidth.base} solid ${theme.primary};
        border-radius: 0;
        outline: 0;
        background: ${theme.surfaceDark};
        color: ${theme.text};
        font-size: ${fontSize.m};

        &:not(:disabled):hover {
            border-color: ${theme.primaryAction};
            color: ${theme.primaryAction};
        }

        &:disabled {
            cursor: default;
            opacity: 0.32;
        }
    `,
};

export const StyledSelect = styled.select<{ $size: SelectSize }>`
    ${({ $size }) => sizeStyles[$size]}
`;
