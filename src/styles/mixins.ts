import { css } from "styled-components";

import { media } from "./media";
import { borderWidth } from "./stylePrimitives";
import { theme } from "./theme";
import { fontSize } from "./typography";
import type { FontSize } from "./typography";

export const ellipsis = css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const lineClamp = (lines: number) => css`
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: ${lines};
`;

interface SlashPrefixParams {
    gap: string;
    size?: FontSize;
}

export const slashPrefix = ({ gap, size }: SlashPrefixParams) => css`
    &::before {
        ${size ? `font-size: ${fontSize[size]};` : ""}
        margin-right: ${gap};
        color: ${theme.primary};
        content: "/";
    }
`;

export const field = css`
    width: 100%;
    height: 42px;
    padding: 8px 10px;
    border: ${borderWidth.base} solid ${theme.primaryDeep};
    border-radius: 0;
    outline: 0;
    background: ${theme.surfaceRaised};
    color: ${theme.text};

    &:focus {
        border-color: ${theme.primaryAccent};
    }

    ${media.desktopLowHeight} {
        height: 36px;
        padding: 4px;
    }
`;
