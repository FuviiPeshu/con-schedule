import { css, styled } from "styled-components";

import { field } from "../../styles/mixins";
import { borderWidth } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { textStyle } from "../../styles/typography";
import type { SelectSize } from "./Select.component";

const sizeStyles: Record<SelectSize, ReturnType<typeof css>> = {
    m: css`
        ${field};
        min-height: 42px;
    `,
    s: css`
        ${field};
        min-height: 32px;
        padding: 2px 4px;
        border: ${borderWidth.base} solid ${theme.primary};
        background: ${theme.surfaceDark};
        ${textStyle({ size: "m", spacing: "s" })}

        &:not(:disabled):hover {
            border-color: ${theme.primaryAction};
            color: ${theme.primaryAction};
        }
    `,
};

export const StyledSelect = styled.select<{ $size: SelectSize }>`
    ${({ $size }) => sizeStyles[$size]}
`;
