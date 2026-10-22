import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const ViewToggleContainer = styled.div`
    display: inline-flex;
    flex: 0 0 auto;
    border: 2px solid ${theme.primaryAction};
`;

export const ViewControls = styled.div`
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
`;

export const ViewOptionCheckbox = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: ${theme.textSubtle};
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;

    &:hover {
        color: ${theme.primaryAction};
    }
`;

export const ViewOptionCheckboxInput = styled.input`
    appearance: none;
    width: 24px;
    height: 24px;
    margin: 0;
    border: 2px solid ${theme.primaryDeep};
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
        content: "x";
        font-size: 0.8rem;
        font-weight: 800;
    }

    ${ViewOptionCheckbox}:hover & {
        border-color: ${theme.primaryAction};

        &:checked::after {
            color: ${theme.primaryAction};
        }
    }
`;

export const ViewToggleButton = styled.button<{ $active: boolean }>`
    padding: 8px 10px;
    border: 0;
    border-right: 1px solid ${theme.primaryDeep};
    background: ${({ $active }) => ($active ? theme.primaryDeep : theme.surfaceBase)};
    color: ${({ $active }) => ($active ? theme.text : theme.textSubtle)};
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    &:last-child {
        border-right: 0;
    }

    &:not(:disabled):hover {
        color: ${theme.primaryAction};
    }

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;
