import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const EventList = styled.div``;

export const FilterControls = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 8px;
    margin-bottom: 8px;
`;

export const ResetButton = styled.button`
    padding: 5px 8px;
    border: 1px solid ${theme.secondary};
    border-radius: 2px;
    background: transparent;
    color: ${theme.text};
    cursor: pointer;

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;

export const ResultCount = styled.p`
    margin: 0 0 8px;
    color: ${theme.textSecondary};
    font-size: 0.8rem;
`;

export const StatusText = styled.p`
    color: ${theme.textSecondary};
`;

export const ErrorBanner = styled.p`
    color: ${theme.error};
`;
