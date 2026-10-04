import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const ListViewPanel = styled.section``;

export const EventList = styled.div``;

export const DayMarker = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 0 8px;

    &:not(:first-of-type) {
        padding-top: 32px;
    }
`;

export const DayLabel = styled.h3`
    flex: 0 0 auto;
    margin: 0;
    color: ${theme.textSubtle};
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    &::before {
        margin-right: 8px;
        color: ${theme.primaryAction};
        content: "DAY //";
    }
`;

export const DayRule = styled.span`
    width: 100%;
    height: 2px;
    background: repeating-linear-gradient(
        -42deg,
        ${theme.textSubtle} 8px 24px,
        ${theme.primaryDeep} 24px 40px
    );
`;

export const ListStatus = styled.p`
    margin: 32px 0;
    color: ${theme.textAccent};
`;
