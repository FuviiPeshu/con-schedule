import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const FilterLabel = styled.label`
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: ${theme.primaryAccent};
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    @media (min-width: 681px) and (max-height: 1000px) {
        gap: 2px;
    }
`;

export const FilterInput = styled.input`
    width: 100%;
    height: 42px;
    padding: 8px 10px;
    border: 2px solid ${theme.primaryDeep};
    border-radius: 0;
    outline: 0;
    background: ${theme.surfaceRaised};
    color: ${theme.text};

    &::placeholder {
        color: ${theme.textSubtle};
    }

    &:focus {
        border-color: ${theme.primaryAccent};
    }

    @media (min-width: 681px) and (max-height: 1000px) {
        height: 36px;
        padding: 4px;
    }
`;

export const FilterSelect = styled.select`
    width: 100%;
    height: 42px;
    padding: 8px 10px;
    border: 2px solid ${theme.primaryDeep};
    border-radius: 0;
    outline: 0;
    background: ${theme.surfaceRaised};
    color: ${theme.text};

    &:focus {
        border-color: ${theme.primaryAccent};
    }

    @media (min-width: 681px) and (max-height: 1000px) {
        height: 36px;
        padding: 4px;
    }
`;
