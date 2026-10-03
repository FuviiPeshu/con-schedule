import { Link } from "react-router-dom";
import { css, styled } from "styled-components";

import { theme } from "../../styles/theme";
import { gridCellHeight, gridHalfCellHeight } from "./CalendarView.component";

type ButtonStateProps = { $active: boolean; $disabled: boolean };

interface CalendarEventLayoutProps {
    $trackColor: string;
    $top: number;
    $height: number;
    $left: number;
    $width: number;
}

export const CalendarViewWrapper = styled.section`
    margin-top: 16px;
    display: grid;
    background: ${theme.surfaceDark};
`;

export const CalendarDaySelector = styled.div`
    display: flex;
    flex-wrap: wrap;
    overflow: visible;
    border: 2px solid ${theme.primaryAction};
`;

export const CalendarDayButton = styled.button<ButtonStateProps>`
    display: grid;
    flex: 1 1 128px;
    gap: 4px;
    min-width: 128px;
    padding: 10px 12px;
    border: none;
    border-right: 1px solid ${theme.primaryDeep};
    background: ${({ $active }) => ($active ? theme.primaryDeep : theme.surfaceRaised)};
    color: ${({ $active }) => ($active ? theme.text : theme.textSubtle)};
    cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
    opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
    text-align: left;

    &:last-child {
        border-right: none;
    }

    &:not(:disabled):hover {
        color: ${theme.primaryAction};
    }
`;

export const CalendarDayLabel = styled.strong`
    font-size: 1rem;
    line-height: 1.2;
    font-weight: 700;
`;

export const CalendarRoomControls = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    max-height: none;
    overflow: visible;
    margin: 8px;
`;

export const CalendarRoomControlsLabel = styled.span`
    flex: 0 0 auto;
    margin-right: 4px;
    color: ${theme.primaryAccent};
    font-size: 0.64rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

export const CalendarHiddenRoom = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    padding: 4px 4px 4px 8px;
    background: ${theme.surfaceRaised};
    color: ${theme.textSubtle};
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-overflow: ellipsis;
    white-space: nowrap;

    > span {
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

export const CalendarViewport = styled.div`
    min-width: 0;
    position: relative;
    border-top: 2px solid ${theme.primary};
`;

export const CalendarRoomHeaderViewport = styled.div`
    position: sticky;
    top: 0;
    z-index: 4;
    width: 100%;
    overflow: hidden;
    border-bottom: 2px solid ${theme.primary};
    background: ${theme.surfaceDark};
`;

export const CalendarScrollViewport = styled.div`
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        height: 0;
    }
`;

export const CalendarHorizontalScroll = styled.div`
    position: fixed;
    right: var(--schedule-scrollbar-width, 12px);
    bottom: 0;
    left: var(--schedule-sidebar-width, 0px);
    z-index: 20;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    border-top: 1px solid ${theme.primaryAccent};
    background: ${theme.surfaceDark};
    scrollbar-color: ${theme.primaryAccent} ${theme.surfaceBase};

    &::-webkit-scrollbar {
        height: 12px;
    }

    &::-webkit-scrollbar-track {
        background: ${theme.surfaceBase};
    }

    &::-webkit-scrollbar-thumb {
        border: 3px solid ${theme.surfaceBase};
        background: ${theme.primaryAccent};
    }
`;

export const CalendarHorizontalScrollContent = styled.div`
    height: 1px;
`;

export const CalendarTimeline = styled.div`
    display: grid;
    width: max-content;
    min-width: max-content;
`;

export const CalendarCanvas = styled.div`
    display: block;
    min-width: max-content;
`;

export const CalendarRoomHeader = styled.div`
    display: grid;
    width: max-content;
    min-height: 64px;
`;

export const CalendarRoomCorner = styled.div`
    display: grid;
    place-items: center end;
    padding: 8px 12px;
    border-right: 1px solid ${theme.primary};
    color: ${theme.textSubtle};
    font-size: 0.64rem;
    letter-spacing: 0.08em;
    text-align: right;
`;

export const CalendarRoomLabel = styled.div<{ $hidden: boolean; $placeholder: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 8px 16px;
    border-right: 1px solid ${theme.primary};
    color: ${({ $hidden }) => ($hidden ? theme.textMuted : theme.textSubtle)};
    opacity: ${({ $hidden, $placeholder }) => ($hidden && !$placeholder ? 0.5 : 1)};
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1.2;
    word-wrap: break-word;
`;

export const CalendarRoomHide = styled.button<{ $compact?: boolean }>`
    flex: 0 0 auto;
    width: ${({ $compact }) => ($compact ? "24px" : "32px")};
    height: ${({ $compact }) => ($compact ? "24px" : "32px")};
    margin-left: 8px;
    padding: 0;
    border: 1px solid ${theme.primaryDeep};
    background: transparent;
    color: ${theme.textSubtle};
    cursor: pointer;
    font-size: ${({ $compact }) => ($compact ? "0.64rem" : "0.8rem")};
    line-height: 1;

    &:hover {
        border-color: ${theme.primaryAction};
        color: ${theme.primaryAction};
    }
`;

export const CalendarRoomDivider = styled.span`
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: ${theme.primaryDeep};
    opacity: 0.64;
`;

export const CalendarHours = styled.div`
    grid-column: 1;
    grid-row: 1;
    position: relative;
    border-right: 1px solid ${theme.primaryDeep};
`;

export const CalendarHourLabel = styled.span`
    position: absolute;
    right: 8px;
    color: ${theme.textSubtle};
    font-size: 0.8rem;
    transform: translateY(-50%);
`;

export const CalendarLane = styled.div`
    grid-column: 2 / -1;
    grid-row: 1;
    position: relative;
    background: ${theme.surfaceHover};
`;

export const CalendarHourLine = styled.span`
    position: absolute;
    right: 0;
    left: 0;
    height: 1px;
    background: ${theme.primaryDeep};
    opacity: 0.64;
`;

export const CalendarEvent = styled(Link).attrs<CalendarEventLayoutProps>(
    ({ $top, $height, $left, $width }) => ({
        style: {
            top: $top,
            height: $height,
            left: $left,
            width: $width,
        },
    })
)<CalendarEventLayoutProps>`
    position: absolute;
    overflow: auto;
    padding: 4px 8px;
    background: ${theme.surfaceBase}EE;
    color: ${theme.text};
    text-decoration: none;
    transition:
        background-color 160ms ease,
        border-color 160ms ease;

    &:hover,
    &:focus-visible {
        border-color: ${theme.primaryAccent};
        background: ${theme.primary};
    }

    &::after {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
        border-top: 1px solid ${({ $trackColor }) => $trackColor};
        border-right: 1px solid ${({ $trackColor }) => $trackColor};
        content: "";
    }

    ${({ $height }) =>
        $height < gridHalfCellHeight &&
        css`
            ${CalendarEventTime} {
                display: none;
            }

            ${CalendarEventTitle} {
                font-size: 0.8rem;
            }

            ${CalendarEventMeta} {
                margin-top: 4px;
            }
        `}
`;

export const CalendarEventTime = styled.span`
    display: block;
    margin-bottom: 4px;
    color: ${theme.primaryAction};
    font-size: 0.64rem;
    letter-spacing: 0.04em;
`;

export const CalendarEventTitle = styled.strong`
    display: block;
    font-size: 1rem;
    line-height: 1.2;
    word-wrap: break-word;
`;

export const CalendarEventMeta = styled.span`
    display: block;
    margin-top: 8px;
    color: ${theme.textAccent};
    font-size: 0.64rem;
    line-height: 1.2;
    word-wrap: break-word;
`;

export const CalendarEmpty = styled.p`
    height: 100%;
    margin: 0;
    padding: 32px 24px;
    color: ${theme.textMuted};
`;
