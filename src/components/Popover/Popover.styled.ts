import { css, styled } from "styled-components";

import { borderWidth } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";

export type PopoverPlacement = "above" | "below";
export type PopoverAlign = "center" | "stretch";

interface PopoverPanelProps {
    $placement: PopoverPlacement;
    $align: PopoverAlign;
}

export const PopoverAnchor = styled.div<{ $align: PopoverAlign }>`
    position: relative;
    display: ${({ $align }) => ($align === "stretch" ? "block" : "inline-flex")};
    min-width: 0;
`;

export const PopoverPanel = styled.div<PopoverPanelProps>`
    position: absolute;
    z-index: 20;
    display: grid;
    gap: 8px;
    min-width: 200px;
    max-width: calc(100vw - 64px);
    padding: 8px;
    border: ${borderWidth.base} solid ${theme.primary};
    background: ${theme.surfaceRaised};
    text-transform: none;
    ${({ $placement }) =>
        $placement === "above" ? "bottom: calc(100% + 4px);" : "top: calc(100% + 4px);"}
    ${({ $align }) =>
        $align === "stretch"
            ? css`
                  left: 0;
                  right: 0;
              `
            : css`
                  left: 50%;
                  transform: translateX(-50%);
              `}
`;
