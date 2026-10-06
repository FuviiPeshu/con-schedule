import { styled } from "styled-components";

import { theme } from "../../styles/theme";
import { CardMeta, CardWrapper, Location, Title } from "../EventCard/EventCard.styled";

export const CompactEventLink = styled(CardWrapper)`
    display: flex;
    flex-direction: column;
    flex: 1 1 200px;
    gap: 4px;
    min-width: 200px;
    max-width: 360px;
    min-height: 80px;
    padding: 8px 10px;
    border: 2px solid ${theme.primary};

    &:first-child,
    &:last-child {
        border-width: 2px;
    }
`;

export const CompactEventTitle = styled(Title)`
    flex: 0 1 auto;
    margin: 0;
    padding-right: 8px;
    overflow: hidden;
    font-size: 1rem;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
`;

export const CompactEventRoom = styled(Location)`
    display: block;
    flex: 0 1 auto;
    margin-left: 0;
    margin-top: 0;
    min-width: 0;
    overflow: hidden;
    font-size: 0.64rem;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;

    &::before {
        content: "";
        margin: 0;
    }
`;

export const CompactEventMeta = styled(CardMeta)`
    display: flex;
    flex-wrap: wrap;
    min-width: 0;
    margin-top: 0;
    padding-top: 4px;
    white-space: normal;
`;
