import { css, styled } from "styled-components";

import { theme } from "../../styles/theme";

export const FilterAside = styled.aside<{ $collapsed: boolean }>`
    grid-area: aside;
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${theme.primaryDeep};
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

    @media (max-width: 680px) {
        display: block;
        width: 100%;
        min-height: auto;
        border-right: 0;
        border-bottom: 2px solid ${theme.primaryAction};
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
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    @media (max-width: 920px) {
        font-size: 1.2rem;
        letter-spacing: 0.04em;
    }
`;

export const CollapseButton = styled.button`
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 2px solid ${theme.primaryDeep};
    background: transparent;
    color: ${theme.text};
    cursor: pointer;

    &:hover {
        border-color: ${theme.primaryAction};
        color: ${theme.primaryAction};
    }

    @media (max-width: 920px) {
        width: 42px;
        height: 42px;
    }

    @media (max-width: 680px) {
        display: none;
        user-select: none;
        pointer-events: none;
    }
`;

export const CollapseIcon = styled.span`
    font-size: 1.1rem;
    line-height: 1;

    @media (max-width: 920px) {
        font-size: 1.28rem;
    }
`;

export const FilterControls = styled.div`
    display: grid;
    gap: 16px;

    @media (min-width: 681px) and (max-height: 1000px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;

        > label:first-child,
        > button {
            grid-column: 1 / -1;
        }
    }
`;

export const ResetButton = styled.button`
    margin-top: 16px;
    padding: 8px 10px;
    border: 2px solid ${theme.primaryAction};
    background: ${theme.primaryAction};
    color: ${theme.textAction};
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-align: center;
    text-transform: uppercase;
    cursor: pointer;

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
