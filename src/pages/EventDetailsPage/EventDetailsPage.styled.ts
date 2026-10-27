import { css, styled } from "styled-components";

import { AppliedFiltersRemove } from "../../components/AppliedFilters/AppliedFilters.styled";
import { EventState } from "../../schedule.types";
import { theme } from "../../styles/theme";

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

interface EventImageOrientationProps {
    $portrait: boolean;
}

interface DetailsHeaderProps {
    $trackColor: string;
    $hasImage: boolean;
}

export const EventImageFrame = styled.button<EventImageOrientationProps>`
    position: absolute;
    z-index: 0;
    top: 0;
    right: ${({ $portrait }) => ($portrait ? "0" : "auto")};
    bottom: 0;
    left: ${({ $portrait }) => ($portrait ? "auto" : "0")};
    width: ${({ $portrait }) => ($portrait ? "50%" : "100%")};
    min-width: ${({ $portrait }) => ($portrait ? "50%" : "0")};
    height: 100%;
    padding: 0;
    overflow: hidden;
    border: 0;
    background: transparent;
    cursor: zoom-in;

    &::after {
        position: absolute;
        z-index: 1;
        inset: 0;
        background: ${({ $portrait }) =>
            $portrait
                ? `linear-gradient(to left, ${theme.surfaceBase}69, ${theme.surfaceBase} 80%, ${theme.surfaceDark} 100%)`
                : `linear-gradient(to top, ${theme.surfaceBase}69, ${theme.surfaceBase}DD 80%, ${theme.surfaceDark} 100%)`};
        content: "";
        pointer-events: none;
    }

    @media (max-width: 680px) {
        ${({ $portrait }) =>
            $portrait &&
            css`
                right: auto;
                left: 0;
                width: 100%;
                min-width: 0;

                &::after {
                    background: linear-gradient(
                        to top,
                        ${theme.surfaceBase}69,
                        ${theme.surfaceBase}DD 80%,
                        ${theme.surfaceDark}
                    );
                }
            `}
    }
`;

export const EventImage = styled.img<EventImageOrientationProps>`
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

export const EventImageDialog = styled.dialog`
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    width: 100vw;
    max-width: none;
    height: 100vh;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    overflow: hidden;
    background: ${theme.surfaceDark}DD;
    color: ${theme.text};

    &:not([open]) {
        display: none;
    }
`;

export const EventFullscreenImage = styled.img`
    display: block;
    width: auto;
    height: auto;
    max-width: 100vw;
    max-height: 100vh;
    max-height: 100dvh;
    object-fit: contain;
`;

export const EventImageCloseButton = styled(AppliedFiltersRemove)`
    position: absolute;
    z-index: 1;
    grid-area: auto;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border: 2px solid ${theme.primary};
    background: ${theme.surfaceDark};
    color: ${theme.text};
    font-size: 1.1rem;

    &:hover {
        border-color: ${theme.primaryAction};
        background: ${theme.primaryAction};
        color: ${theme.textAction};
    }
`;

export const DetailsHeader = styled.header<DetailsHeaderProps>`
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    gap: 8px;
    min-height: ${({ $hasImage }) => ($hasImage ? "360px" : "auto")};
    overflow: hidden;
    padding: 24px 64px 48px 64px;
    border-top: 4px solid ${theme.primaryAction};
    border-bottom: 1px solid ${theme.primary};
    background: ${theme.surfaceDark};

    ${({ $hasImage }) =>
        $hasImage &&
        css`
            > :not(button):not([aria-hidden="true"]) {
                pointer-events: none;
            }

            > div:last-child a {
                pointer-events: auto;
            }
        `}

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
        min-height: ${({ $hasImage }) => ($hasImage ? "320px" : "auto")};
    }
`;

export const DetailsHeaderDetails = styled.div`
    position: relative;
    z-index: 2;
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
    background: ${theme.surfaceBase}DD;
    color: ${({ $state }) => ($state === EventState.Live ? theme.statusGood : theme.textAccent)};
    font-size: 0.64rem;
`;

export const DetailsTitle = styled.h1`
    position: relative;
    z-index: 2;
    margin: 0;
    color: ${theme.text};
    font-size: 4.4rem;
    font-weight: 800;
    line-height: 1;
    text-shadow: 0 2px 8px ${theme.black};

    @media (max-width: 680px) {
        font-size: 3rem;
    }
`;

export const EventAbstract = styled.div`
    position: relative;
    z-index: 2;
    color: ${theme.textAccent};
    font-size: 1.2rem;
    line-height: 1.4;
    text-shadow: 0 1px 4px ${theme.black};

    p {
        margin: 0;
    }
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

export const SpeakerList = styled.ul`
    display: grid;
    gap: 4px;
    margin: 0;
    padding: 0;
    color: ${theme.text};
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.04em;
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
