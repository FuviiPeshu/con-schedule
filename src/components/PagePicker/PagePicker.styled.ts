import { styled } from "styled-components";

import { ellipsis, slashPrefix } from "../../styles/mixins";
import { borderWidth, transition } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { textStyle } from "../../styles/typography";

export const PagePickerStatus = styled.span<{ $minWidth?: number }>`
    width: ${({ $minWidth }) => ($minWidth ? `calc(${$minWidth}ch + 1ch)` : "auto")};
    min-width: ${({ $minWidth }) => ($minWidth ? `${$minWidth}ch` : "auto")};
    padding: 0 8px;
    ${ellipsis}
    color: ${theme.textSubtle};
    ${textStyle({ size: "m", spacing: "s" })}
    text-align: center;
`;

export const PagePickerTrigger = styled.button<{ $minWidth?: number }>`
    width: ${({ $minWidth }) => ($minWidth ? `calc(${$minWidth}ch + 1ch)` : "auto")};
    min-width: ${({ $minWidth }) => ($minWidth ? `${$minWidth}ch` : "auto")};
    min-height: 32px;
    padding: 0 8px;
    border: ${borderWidth.base} solid transparent;
    border-bottom-color: ${theme.primaryDeep};
    background: transparent;
    color: ${theme.textSubtle};
    cursor: pointer;
    text-align: center;
    text-transform: inherit;
    ${ellipsis}
    ${textStyle({ size: "m", spacing: "s" })}
    ${transition({ properties: ["color", "border-color"], duration: "fast" })}

    &:hover,
    &[aria-expanded="true"] {
        border-color: ${theme.primaryAction};
        color: ${theme.primaryAction};
    }
`;

export const PagePickerList = styled.ul`
    display: grid;
    max-height: 240px;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
`;

export const PagePickerItem = styled.button`
    width: 100%;
    padding: 6px 8px;
    border: 0;
    border-left: ${borderWidth.base} solid transparent;
    background: transparent;
    color: ${theme.text};
    cursor: pointer;
    text-align: left;
    ${textStyle({ size: "m", spacing: "s" })}
    ${ellipsis}

    &[aria-current="page"] {
        padding-left: 2px;
        ${slashPrefix({ gap: "8px", size: "m" })}
        color: ${theme.primaryAccent};

        &::before {
            color: ${theme.primaryAction};
        }
    }

    &:hover,
    &:focus-visible {
        background: ${theme.surfaceHover};
        color: ${theme.primaryAction};
    }
`;

export const PagePickerEmpty = styled.p`
    margin: 0;
    padding: 4px 8px;
    color: ${theme.textMuted};
    ${textStyle({ size: "s", spacing: "xs", uppercase: true })}
`;
