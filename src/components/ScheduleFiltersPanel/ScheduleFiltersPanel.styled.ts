import { css, styled } from "styled-components";

import { media } from "../../styles/media";
import { borderWidth } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { fontSize, textStyle, typography } from "../../styles/typography";
import { ButtonComponent } from "../Button";

export const FilterAside = styled.aside<{ $collapsed: boolean }>`
    grid-area: aside;
    display: flex;
    flex-direction: column;
    border-right: ${borderWidth.thin} solid ${theme.primaryDeep};
    color: ${theme.text};
    background: ${theme.surfaceDark};
    padding: 24px 20px 32px;

    ${({ $collapsed }) =>
        $collapsed &&
        css`
            width: 64px;
            padding-right: 8px;
            padding-left: 8px;
        `}

    ${media.mobile} {
        display: block;
        width: 100%;
        min-height: auto;
        border-right: 0;
        border-bottom: ${borderWidth.base} solid ${theme.primaryAction};
    }
`;

export const FilterBody = styled.div`
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    padding-top: 16px;
`;

export const FilterHeader = styled.div<{ $collapsed: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;

    ${({ $collapsed }) =>
        $collapsed &&
        css`
            justify-content: center;
        `}
`;

export const FilterPanelTitle = styled.h2`
    display: block;
    margin: 0;
    color: ${theme.primaryAction};
    ${textStyle({ size: "display", weight: "bold", spacing: "l", uppercase: true })}

    ${media.tablet} {
        ${textStyle({ size: "xl", spacing: "s" })}
    }
`;

export const CollapseButton = styled(ButtonComponent)`
    ${media.tablet} {
        width: 42px;
        height: 42px;
    }

    ${media.mobile} {
        display: none;
        user-select: none;
        pointer-events: none;
    }
`;

export const CollapseIcon = styled.span`
    ${textStyle({ size: "l", lineHeight: "none" })}

    ${media.tablet} {
        font-size: ${fontSize.xxl};
    }
`;

export const FilterControls = styled.div`
    display: grid;
    gap: 16px;

    ${media.desktopLowHeight} {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;

        > label:first-child,
        > button {
            grid-column: 1 / -1;
        }
    }
`;

export const FilterLabel = styled.label`
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: ${theme.primaryAccent};
    ${typography.boldUppercaseLabel}

    ${media.desktopLowHeight} {
        gap: 2px;
    }
`;

export const ResetButton = styled(ButtonComponent)`
    margin-top: 16px;
`;
