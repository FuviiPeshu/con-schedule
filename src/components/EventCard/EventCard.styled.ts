import { Link } from "react-router-dom";
import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const CardWrapper = styled(Link)<{ $trackColor: string }>`
    position: relative;
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr) max-content;
    gap: 16px;
    align-items: start;
    min-width: 0;
    overflow: hidden;
    padding: 16px 24px 16px 16px;
    border: 4px solid transparent;
    border-top-width: 2px;
    border-bottom-width: 2px;
    border-color: ${theme.primaryDeep};
    background: ${theme.surfaceRaised};
    color: ${theme.text};
    text-decoration: none;
    transition: background-color 256ms ease-out;

    &:first-child {
        border-top-width: 4px;
    }
    &:last-child {
        border-bottom-width: 4px;
    }

    &:hover {
        background: ${theme.surfaceHover};
    }

    &::before {
        position: absolute;
        z-index: 0;
        inset: -2px 0;
        background: ${theme.primaryDeep};
        content: "";
        pointer-events: none;
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 500ms ease;
    }

    &:hover::before,
    &:focus-visible::before {
        transform: scaleX(1);
    }

    > * {
        position: relative;
        z-index: 1;
    }

    &::after {
        position: absolute;
        z-index: 2;
        top: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
        border-top: 1px solid ${({ $trackColor }) => $trackColor};
        border-right: 1px solid ${({ $trackColor }) => $trackColor};
        content: "";
    }

    @media (max-width: 680px) {
        grid-template-columns: 72px minmax(0, 1fr) max-content;
        gap: 14px;
        padding: 16px 16px 16px 12px;
    }

    @media (max-width: 420px) {
        grid-template-columns: 1fr max-content;

        > :first-child {
            grid-column: 1 / -1;
        }
    }
`;

export const TimeBlock = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 8px 4px 0 0;
    border-right: 1px solid ${theme.primary};

    @media (max-width: 420px) {
        display: flex;
        align-items: baseline;
        gap: 2px;
        padding: 0;
        border-right: 0;
    }
`;

export const TimeStart = styled.time`
    color: ${theme.primaryAction};
    font-size: 1.28rem;
    font-weight: 700;
    letter-spacing: 0.02em;

    @media (max-width: 680px) {
        font-size: 1.1rem;
    }
`;

export const TimeEnd = styled.span`
    margin-top: 4px;
    color: ${theme.textAccent};
    font-size: 0.8rem;
`;

export const Duration = styled.span`
    margin-top: 16px;
    color: ${theme.textMuted};
    font-size: 0.64rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
`;

export const CardContent = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

export const TitleRow = styled.div`
    display: flex;
    align-items: center;
`;

export const Title = styled.h3`
    flex: 0 1 auto;
    margin: 0;
    overflow: hidden;
    color: ${theme.text};
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 680px) {
        font-size: 1.1rem;
    }
`;

export const Location = styled.span`
    flex: 0 1 auto;
    margin-left: 16px;
    overflow: hidden;
    color: ${theme.primaryAccent};
    font-size: 0.8rem;
    letter-spacing: 0.02em;
    max-width: 100%;
    text-align: left;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;

    &::before {
        font-size: 1rem;
        margin-right: 8px;
        color: ${theme.primary};
        content: "/";
    }
`;

export const Description = styled.p`
    display: -webkit-box;
    width: 100%;
    margin: 4px 0 0;
    overflow: hidden;
    color: ${theme.textMuted};
    font-size: 0.8rem;
    line-height: 1.4;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
`;

export const CardMeta = styled.div`
    display: flex;
    flex-wrap: nowrap;
    gap: 4px 16px;
    margin-top: 8px;
    color: ${theme.textAccent};
    font-size: 0.64rem;
    letter-spacing: 0.02em;
`;

export const MetaItem = styled.span`
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;

    &::before {
        margin-right: 4px;
        color: ${theme.primary};
        content: "/";
    }
`;

export const CardArrow = styled.span`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100% - 0.55rem);
    gap: 4px;
    color: ${theme.primaryAccent};
    transition: color 256ms ease;

    ${CardWrapper}:hover & {
        color: ${theme.primaryAction};
    }
`;

export const CardArrowLabel = styled.span`
    font-size: 0.55rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
`;

export const CardArrowIcon = styled.span`
    font-size: 1.28rem;
    line-height: 1;
`;
