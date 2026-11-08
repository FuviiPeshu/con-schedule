import { styled } from "styled-components";

import { borderWidth } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { textStyle } from "../../styles/typography";

export const CheckboxLabel = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: ${theme.textSubtle};
    cursor: pointer;
    ${textStyle({ size: "m", weight: "bold", spacing: "s", uppercase: true })}

    &:hover {
        color: ${theme.primaryAction};
    }
`;

export const CheckboxInput = styled.input`
    appearance: none;
    width: 20px;
    height: 20px;
    margin: 0;
    border: ${borderWidth.base} solid ${theme.primaryDeep};
    background: transparent;
    cursor: pointer;

    &:checked {
        border-color: ${theme.primaryAction};
        background: ${theme.primaryDeep};
    }

    &:checked::after {
        display: grid;
        width: 100%;
        height: 100%;
        place-items: center;
        color: ${theme.textSubtle};
        content: "X";
        ${textStyle({ size: "m", weight: "extrabold", lineHeight: "none" })}
    }

    ${CheckboxLabel}:hover & {
        border-color: ${theme.primaryAction};

        &:checked::after {
            color: ${theme.primaryAction};
        }
    }
`;
