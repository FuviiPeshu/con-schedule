import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const PaginationBar = styled.nav`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    column-gap: 16px;
    margin: 16px 0 8px;
    text-transform: uppercase;

    @media (max-width: 680px) {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
    }
`;

export const PaginationRange = styled.span`
    grid-column: 1;
    min-width: 0;
    overflow: hidden;
    color: ${theme.primaryAccent};
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    text-overflow: ellipsis;
    white-space: nowrap;
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

export const PaginationButton = styled.button`
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 2px solid ${theme.primary};
    background: transparent;
    color: ${theme.text};
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;

    &:not(:disabled):hover {
        border-color: ${theme.primaryAction};
        color: ${theme.primaryAction};
    }

    &:disabled {
        cursor: default;
        opacity: 0.32;
    }
`;

export const PaginationStatus = styled.span`
    padding: 0 4px;
    color: ${theme.textSubtle};
    font-size: 0.8rem;
    letter-spacing: 0.04em;
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
    font-size: 0.8rem;
    letter-spacing: 0.04em;
`;

export const PageSizeLabel = styled.span`
    color: ${theme.primaryAccent};
`;

export const PageSizeSelect = styled.select`
    min-height: 32px;
    padding: 2px 4px;
    border: 2px solid ${theme.primary};
    border-radius: 0;
    outline: 0;
    background: ${theme.surfaceDark};
    color: ${theme.text};
    font-size: 0.8rem;

    &:not(:disabled):hover {
        border-color: ${theme.primaryAction};
        color: ${theme.primaryAction};
    }

    &:disabled {
        cursor: default;
        opacity: 0.32;
    }
`;
