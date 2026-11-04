import { styled } from "styled-components";

import { media } from "../../styles/media";
import { ellipsis } from "../../styles/mixins";
import { theme } from "../../styles/theme";
import { textStyle } from "../../styles/typography";

export const PaginationBar = styled.nav`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    column-gap: 16px;
    margin: 16px 0 8px;
    text-transform: uppercase;

    ${media.mobile} {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
    }
`;

export const PaginationRange = styled.span`
    grid-column: 1;
    min-width: 0;
    color: ${theme.primaryAccent};
    ${textStyle({ size: "m", spacing: "s" })}
    ${ellipsis}
`;

export const PaginationControls = styled.div`
    display: flex;
    align-items: center;
    grid-column: 2;
    grid-row: 1;
    justify-content: center;
    gap: 8px;
    min-width: 0;
`;

export const PaginationStatus = styled.span<{ $minWidth?: number }>`
    min-width: ${({ $minWidth }) => ($minWidth ? `${$minWidth}ch` : "auto")};
    padding: 0 4px;
    color: ${theme.textSubtle};
    ${textStyle({ size: "m", spacing: "s" })}
    text-align: center;
`;

export const PageSizeControl = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    grid-column: 3;
    grid-row: 1;
    justify-self: end;
    min-width: 0;
    color: ${theme.textSubtle};
    ${textStyle({ size: "m", spacing: "s" })}
`;

export const PageSizeLabel = styled.span`
    color: ${theme.primaryAccent};
`;
