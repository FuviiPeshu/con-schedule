import { styled } from "styled-components";

import { lineClamp } from "../../styles/mixins";
import { borderWidth } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { textStyle } from "../../styles/typography";
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
    border: ${borderWidth.base} solid ${theme.primary};

    &:first-child,
    &:last-child {
        border-width: ${borderWidth.base};
    }
`;

export const CompactEventTitle = styled(Title)`
    flex: 0 1 auto;
    margin: 0;
    padding-right: 8px;
    ${textStyle({ size: "base", lineHeight: "tight" })}
    ${lineClamp(2)}
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;
`;

export const CompactEventRoom = styled(Location)`
    display: block;
    flex: 0 1 auto;
    margin-left: 0;
    margin-top: 0;
    min-width: 0;
    overflow: hidden;
    ${textStyle({ size: "s" })}
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
