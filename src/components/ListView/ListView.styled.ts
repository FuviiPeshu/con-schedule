import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const ListViewPanel = styled.section`
    flex: 1 0 auto;
`;

export const EventList = styled.div``;

export const CompactEventRows = styled.div`
    display: grid;
    gap: 8px;
`;

export const CompactEventRow = styled.div`
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr);
    gap: 4px;
    align-items: stretch;
    min-width: 0;
    padding: 8px 0;
`;

export const CompactEventTime = styled.time`
    color: ${theme.primaryAction};
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
`;

export const CompactEventItems = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
`;

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
