import { css, keyframes, styled } from "styled-components";

import { media } from "../../styles/media";
import { ellipsis } from "../../styles/mixins";
import { borderWidth, duration, easing, transition } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { textStyle, typography } from "../../styles/typography";
import { ButtonComponent } from "../Button";

const appliedFilterFadeIn = keyframes`
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
`;

export const AppliedFiltersWrapper = styled.div<{ $compact?: boolean }>`
    display: grid;
    gap: 4px;
    margin: auto 0 0;
    padding-top: 16px;

    ${media.mobile} {
        display: none;
    }
`;

export const AppliedFiltersLabel = styled.span<{ $compact?: boolean }>`
    color: ${theme.primaryAction};
    ${typography.uppercaseLabel}

    ${({ $compact }) =>
        $compact &&
        css`
            ${textStyle({ size: "xxs", spacing: "none" })}
            white-space: nowrap;
        `}
`;

export const AppliedFiltersList = styled.ul<{ $compact?: boolean }>`
    display: grid;
    gap: 4px;
    margin: 4px 0 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;

    ${({ $compact }) =>
        $compact &&
        css`
            max-height: 240px;
            overflow: visible;
        `}

    ${media.shortScreen} {
        ${({ $compact }) =>
            $compact
                ? css`
                      grid-template-columns: 1fr;
                  `
                : css`
                      grid-template-columns: 1fr 1fr 1fr;
                  `}
    }
`;

export const AppliedFilterWrapper = styled.li<{ $compact?: boolean }>`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: "label value remove";
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-left: ${borderWidth.base} solid ${theme.primaryAccent};
    background: ${theme.surfaceRaised};
    color: ${theme.primaryAccent};
    ${textStyle({ size: "s", weight: "bold", spacing: "l" })}

    ${({ $compact }) =>
        $compact &&
        css`
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-areas: "label remove";
            gap: 4px;
            padding: 4px;
            ${textStyle({ size: "xs", spacing: "none" })}
            position: relative;
            display: block;
            padding: 0;
            border-left: 0;
            background: transparent;
            overflow: visible;
        `}

    ${media.shortScreen} {
        ${({ $compact }) =>
            !$compact &&
            css`
                grid-template-columns: 1fr;
                grid-template-rows: auto auto;
                grid-template-areas:
                    "header"
                    "value";
            `}
    }
`;

export const AppliedFilterCompact = styled.button`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 4px;
    border: ${borderWidth.base} solid ${theme.primaryDeep};
    border-left-color: ${theme.primaryAccent};
    background: ${theme.surfaceRaised};
    color: ${theme.primaryAccent};
    text-align: left;
    text-transform: uppercase;
    ${ellipsis}
    ${transition({ properties: "opacity", duration: "slow" })}

    span {
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

export const ExpandedAppliedFilterWrapper = styled.div<{ $visible: boolean }>`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    gap: 4px;
    width: 256px;
    padding: 4px;
    border: ${borderWidth.base} solid ${theme.primaryDeep};
    border-left-color: ${theme.primaryAccent};
    background: ${theme.surfaceRaised};
    pointer-events: auto;
    ${transition({ properties: "opacity", duration: "slow" })}
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};

    ${({ $visible }) =>
        $visible
            ? css`
                  animation: ${appliedFilterFadeIn} ${duration.slow} ${easing.standard} both;
              `
            : css`
                  animation: none;
              `}
`;

export const ExpandedAppliedFilterActions = styled.div`
    height: calc(100% + 4px);
    position: absolute;
    left: 100%;
    display: grid;
    gap: 4px;
`;

export const ExpandedAppliedFilterAction = styled(ButtonComponent)`
    background: ${theme.surfaceRaised};
`;

export const ExpandedAppliedFilter = styled.div`
    display: grid;
    gap: 2px;
    min-width: 0;
`;

export const ExpandedAppliedFilterLabel = styled.span`
    color: ${theme.primaryAccent};
    ${textStyle({ size: "xs", weight: "bold", spacing: "xs", uppercase: true })}
    ${ellipsis}
`;

export const ExpandedAppliedFilterValue = styled.span`
    overflow: hidden;
    color: ${theme.text};
    ${textStyle({ size: "s", spacing: "xs" })}
`;

export const AppliedFilterWrapperHeader = styled.div<{ $compact?: boolean }>`
    display: contents;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;

    ${({ $compact }) =>
        $compact &&
        css`
            display: flex;
            align-items: center;
            gap: 4px;
        `}

    > span {
        grid-area: label;
        ${ellipsis}
    }

    ${media.shortScreen} {
        ${({ $compact }) =>
            !$compact &&
            css`
                display: flex;
                grid-area: header;
            `}
    }
`;

export const AppliedFiltersValue = styled.span`
    grid-area: value;
    min-width: 0;
    color: ${theme.text};
    ${textStyle({ size: "m", weight: "regular", spacing: "xs" })}
    ${ellipsis}
`;

export const AppliedFiltersRemove = styled(ButtonComponent)`
    grid-area: remove;
`;

export const AppliedFiltersClear = styled(ButtonComponent)`
    width: 100%;
`;

export const AppliedFiltersEmpty = styled.span`
    color: ${theme.textMuted};
    ${textStyle({ size: "s", spacing: "xs", uppercase: true })}
`;
