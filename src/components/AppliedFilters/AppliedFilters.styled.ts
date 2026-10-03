import { css, keyframes, styled } from "styled-components";

import { theme } from "../../styles/theme";

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

    @media (max-width: 680px) {
        display: none;
    }
`;

export const AppliedFiltersLabel = styled.span<{ $compact?: boolean }>`
    color: ${theme.primaryAction};
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    ${({ $compact }) =>
        $compact &&
        css`
            font-size: 0.5rem;
            letter-spacing: 0em;
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

    @media (max-height: 680px) {
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
    border-left: 2px solid ${theme.primaryAccent};
    background: ${theme.surfaceRaised};
    color: ${theme.primaryAccent};
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.08em;

    ${({ $compact }) =>
        $compact &&
        css`
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-areas: "label remove";
            gap: 4px;
            padding: 4px;
            font-size: 0.55rem;
            letter-spacing: 0em;
            position: relative;
            display: block;
            padding: 0;
            border-left: 0;
            background: transparent;
            overflow: visible;
        `}

    @media (max-height: 680px) {
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
    overflow: hidden;
    border: 2px solid ${theme.primaryDeep};
    border-left-color: ${theme.primaryAccent};
    background: ${theme.surfaceRaised};
    color: ${theme.primaryAccent};
    text-align: left;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
    transition: opacity 500ms ease;

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
    border: 2px solid ${theme.primaryDeep};
    border-left-color: ${theme.primaryAccent};
    background: ${theme.surfaceRaised};
    pointer-events: auto;
    transition: opacity 500ms ease;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};

    ${({ $visible }) =>
        $visible
            ? css`
                  animation: ${appliedFilterFadeIn} 500ms ease both;
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

export const ExpandedAppliedFilterAction = styled.button`
    height: 100%;
    padding: 4px 8px;
    border: 2px solid ${theme.primaryDeep};
    color: ${theme.primary};
    background: ${theme.surfaceDark};
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;

    &:hover {
        border-color: ${theme.primaryAction};
        background: ${theme.primaryAction};
        color: ${theme.textAction};
    }
`;

export const ExpandedAppliedFilter = styled.div`
    display: grid;
    gap: 2px;
    min-width: 0;
`;

export const ExpandedAppliedFilterLabel = styled.span`
    overflow: hidden;
    color: ${theme.primaryAccent};
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
`;

export const ExpandedAppliedFilterValue = styled.span`
    overflow: hidden;
    color: ${theme.text};
    font-size: 0.64rem;
    letter-spacing: 0.02em;
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    @media (max-height: 680px) {
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
    overflow: hidden;
    color: ${theme.text};
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const AppliedFiltersRemove = styled.button`
    grid-area: remove;
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 1px solid ${theme.primary};
    background: transparent;
    color: ${theme.textSubtle};
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1;

    &:hover {
        border-color: ${theme.primaryAction};
        color: ${theme.primaryAction};
    }
`;

export const AppliedFiltersClear = styled.button`
    width: 100%;
    padding: 4px 6px;
    border: 2px solid ${theme.primaryAction};
    background: ${theme.primaryAction};
    color: ${theme.textAction};
    cursor: pointer;
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.04em;

    &:not(:disabled):hover {
        border-color: ${theme.primaryAction};
        background: ${theme.surfaceHover};
        color: ${theme.primaryAction};
    }

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;

export const AppliedFiltersEmpty = styled.span`
    color: ${theme.textMuted};
    font-size: 0.64rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
`;
