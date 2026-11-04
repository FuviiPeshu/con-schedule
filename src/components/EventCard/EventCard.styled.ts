import { Link } from "react-router-dom";
import { styled } from "styled-components";

import { media } from "../../styles/media";
import { ellipsis, lineClamp, slashPrefix } from "../../styles/mixins";
import { borderWidth, transition } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { fontSize, textStyle } from "../../styles/typography";

export const CardWrapper = styled(Link)<{ $trackColor: string }>`
    position: relative;
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr) max-content;
    gap: 16px;
    align-items: start;
    min-width: 0;
    overflow: hidden;
    padding: 16px 24px 16px 16px;
    border: ${borderWidth.thick} solid transparent;
    border-top-width: ${borderWidth.base};
    border-bottom-width: ${borderWidth.base};
    border-color: ${theme.primaryDeep};
    background: ${theme.surfaceRaised};
    color: ${theme.text};
    text-decoration: none;
    ${transition({ properties: "background-color", easing: "out" })}

    &:first-child {
        border-top-width: ${borderWidth.thick};
    }
    &:last-child {
        border-bottom-width: ${borderWidth.thick};
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
        ${transition({ properties: "transform", duration: "slow" })}
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
        border-top: ${borderWidth.thin} solid ${({ $trackColor }) => $trackColor};
        border-right: ${borderWidth.thin} solid ${({ $trackColor }) => $trackColor};
        content: "";
    }

    ${media.mobile} {
        grid-template-columns: 72px minmax(0, 1fr) max-content;
        gap: 14px;
        padding: 16px 16px 16px 12px;
    }

    ${media.smallMobile} {
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
    border-right: ${borderWidth.thin} solid ${theme.primary};

    ${media.smallMobile} {
        display: flex;
        align-items: baseline;
        gap: 2px;
        padding: 0;
        border-right: 0;
    }
`;

export const TimeStart = styled.time`
    color: ${theme.primaryAction};
    ${textStyle({ size: "xxl", weight: "bold", spacing: "xs" })}

    ${media.mobile} {
        font-size: ${fontSize.l};
    }
`;

export const TimeEnd = styled.span`
    margin-top: 4px;
    color: ${theme.textAccent};
    ${textStyle({ size: "m" })}
`;

export const Duration = styled.span`
    margin-top: 16px;
    color: ${theme.textMuted};
    ${textStyle({ size: "s", spacing: "s", uppercase: true })}
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
    color: ${theme.text};
    ${textStyle({ size: "display", weight: "extrabold", spacing: "none", lineHeight: "tight" })}
    ${ellipsis}

    ${media.mobile} {
        font-size: ${fontSize.l};
    }
`;

export const Location = styled.span`
    flex: 0 1 auto;
    margin-left: 16px;
    color: ${theme.primaryAccent};
    ${textStyle({ size: "m", spacing: "xs" })}
    ${ellipsis}
    max-width: 100%;
    text-align: left;
    text-transform: uppercase;

    ${slashPrefix({ gap: "8px", size: "base" })}
`;

export const Description = styled.p`
    width: 100%;
    margin: 4px 0 0;
    color: ${theme.textMuted};
    ${textStyle({ size: "m", lineHeight: "relaxed" })}
    ${lineClamp(2)}
`;

export const CardMeta = styled.div`
    display: flex;
    flex-wrap: nowrap;
    gap: 4px 16px;
    margin-top: 8px;
    color: ${theme.textAccent};
    ${textStyle({ size: "s", spacing: "xs" })}
`;

export const MetaItem = styled.span`
    max-width: 100%;
    ${ellipsis}

    ${slashPrefix({ gap: "4px" })}
`;

export const CardArrow = styled.span`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100% - ${fontSize.xs});
    gap: 4px;
    color: ${theme.primaryAccent};
    ${transition({ properties: "color" })}

    ${CardWrapper}:hover & {
        color: ${theme.primaryAction};
    }
`;

export const CardArrowLabel = styled.span`
    ${textStyle({ size: "xs", spacing: "l", uppercase: true })}
    white-space: nowrap;
`;

export const CardArrowIcon = styled.span`
    ${textStyle({ size: "xxl", lineHeight: "none" })}
`;
