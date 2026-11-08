import { styled } from "styled-components";

import { field } from "../../styles/mixins";
import { theme } from "../../styles/theme";
import { textStyle, type FontSize } from "../../styles/typography";
import type { InputSize } from "./Input.component";

const minSizes: Record<InputSize, { width: string; height: string; padding: string; fontSize: FontSize }> = {
    s: { width: "32px", height: "32px", padding: "2px 4px", fontSize: "m" },
    m: { width: "64px", height: "42px", padding: "8px 10px", fontSize: "base" },
    l: { width: "128px", height: "48px", padding: "12px 16px", fontSize: "l" },
};

export const StyledInput = styled.input<{ $size: InputSize }>`
    ${field}
    min-width: ${({ $size }) => minSizes[$size].width};
    min-height: ${({ $size }) => minSizes[$size].height};
    padding: ${({ $size }) => minSizes[$size].padding};
    ${({ $size }) => textStyle({ size: minSizes[$size].fontSize, lineHeight: "none" })}

    &::placeholder {
        color: ${theme.textSubtle};
    }
`;
