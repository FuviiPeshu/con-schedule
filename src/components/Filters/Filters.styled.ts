import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const FilterLabel = styled.label`
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: ${theme.textSecondary};
    font-size: 0.9rem;
`;

export const FilterInput = styled.input`
    min-width: 256px;
    padding: 4px;
    border: 1px solid ${theme.secondary};
    border-radius: 2px;
    background: ${theme.background};
    color: ${theme.text};
`;

export const FilterSelect = styled.select`
    min-width: 128px;
    padding: 4px;
    border: 1px solid ${theme.secondary};
    border-radius: 2px;
    background: ${theme.background};
    color: ${theme.text};
`;
