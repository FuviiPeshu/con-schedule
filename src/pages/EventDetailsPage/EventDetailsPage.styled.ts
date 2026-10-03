import { Link } from "react-router-dom";
import { styled } from "styled-components";

import { EventState } from "../../schedule.types";
import { theme } from "../../styles/theme";

export const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 16px;
    margin-bottom: 16px;
    color: ${theme.primaryAccent};
    cursor: pointer;
    font-size: 0.64rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;

    &:hover {
        color: ${theme.primaryAction};
    }
`;

export const BackArrow = styled.span`
    color: ${theme.primaryAction};
    font-size: 1rem;
`;

export const Panel = styled.article`
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    min-height: 100%;
    overflow: auto;
    padding: 16px 0 0;

    @media (max-width: 680px) {
        & > a {
            margin-left: 24px;
        }
    }
`;

export const DetailsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
    width: 100%;
    background: ${theme.surfaceBase};
`;

export const DetailsHeader = styled.header<{ $trackColor: string }>`
    position: relative;
    display: grid;
    gap: 8px;
    padding: 24px 64px 48px 64px;
    border-top: 4px solid ${theme.primaryAction};
    border-bottom: 1px solid ${theme.primary};
    background: ${theme.surfaceDark};

    &::before {
        position: absolute;
        z-index: 2;
        bottom: 16px;
        left: 16px;
        width: 16px;
        height: 16px;
        border-bottom: 1px solid ${({ $trackColor }) => $trackColor};
        border-left: 1px solid ${({ $trackColor }) => $trackColor};
        content: "";
    }

    &::after {
        position: absolute;
        z-index: 2;
        top: 16px;
        right: 16px;
        width: 16px;
        height: 16px;
        border-top: 1px solid ${({ $trackColor }) => $trackColor};
        border-right: 1px solid ${({ $trackColor }) => $trackColor};
        content: "";
    }

    @media (max-width: 680px) {
        padding: 16px 32px 24px 32px;
    }
`;

export const DetailsHeaderDetails = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    color: ${theme.primaryAccent};
    font-size: 0.64rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

export const StatusPill = styled.span<{ $state: EventState }>`
    padding: 6px 8px;
    border: 1px solid
        ${({ $state }) => ($state === EventState.Live ? theme.statusGood : theme.primaryDeep)};
    color: ${({ $state }) => ($state === EventState.Live ? theme.statusGood : theme.textAccent)};
    font-size: 0.64rem;
`;

export const DetailsTitle = styled.h1`
    margin: 0;
    color: ${theme.text};
    font-size: 4.4rem;
    font-weight: 800;
    line-height: 1;

    @media (max-width: 680px) {
        font-size: 3rem;
    }
`;

export const EventAbstract = styled.p`
    margin: 0;
    color: ${theme.textAccent};
    font-size: 1.2rem;
    line-height: 1.4;
`;

export const InfoBlockGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-bottom: 1px solid ${theme.primary};

    @media (max-width: 680px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

export const InfoBlock = styled.div`
    display: grid;
    gap: 4px;
    min-width: 0;
    padding: 16px;
    border-right: 1px solid ${theme.primary};

    &:last-child {
        border-right: 0;
    }

    @media (max-width: 680px) {
        &:nth-child(2n) {
            border-right: 0;
        }

        &:nth-child(-n + 2) {
            border-bottom: 1px solid ${theme.primary};
        }
    }
`;

export const InfoLabel = styled.span`
    margin-bottom: 2px;
    color: ${theme.primaryAccent};
    font-size: 1rem;
    letter-spacing: 0.08em;
    font-weight: 700;
    text-transform: uppercase;
`;

export const InfoValue = styled.span`
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
    overflow: hidden;
    color: ${theme.text};
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.04em;
`;

export const DetailsLayout = styled.div`
    display: grid;
    flex: 1 1 auto;
    grid-template-columns: minmax(0, 1fr) 25%;
    gap: 64px;
    background: ${theme.surfaceRaised};

    @media (max-width: 680px) {
        grid-template-columns: 1fr;
        gap: 8px;
    }
`;

export const DetailsBodySection = styled.section`
    padding: 32px 0 32px 24px;
    color: ${theme.textAccent};
    font-size: 1rem;
    line-height: 1.4;

    & > :nth-child(2) {
        margin-top: 8px;
    }

    p {
        margin: 0;
        white-space: pre-wrap;
    }

    a {
        color: ${theme.primaryAction};
        text-decoration: underline;

        &:hover {
            background: ${theme.primaryAction};
            color: ${theme.textAction};
            text-decoration: none;
        }
    }

    @media (max-width: 680px) {
        padding: 24px 32px;
    }
`;

export const DetailsRail = styled.aside`
    display: grid;
    align-content: start;
    /* background-color: ${theme.primaryDeep}; */

    @media (max-width: 680px) {
        border-top: 1px solid ${theme.primaryDeep};
    }
`;

export const MetaPanel = styled.section`
    display: grid;
    gap: 4px;
    min-width: 0;
    padding: 16px;
    padding-right: 0;
    border-bottom: 1px solid ${theme.primaryDeep};

    &:last-child {
        border-bottom: 0;
    }
`;

export const MetaList = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin: 0;
    padding: 0;
    color: ${theme.text};
    list-style: none;
`;

export const Tag = styled.li`
    width: fit-content;
    padding: 6px 8px;
    border: 1px solid ${theme.primaryAction};
    color: ${theme.textHighlight};
    font-size: 0.8rem;
    letter-spacing: 0.08em;
`;

export const TrackMark = styled.span<{ $trackColor: string }>`
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    padding-bottom: 0.64rem;
    background: ${({ $trackColor }) => $trackColor};
`;
