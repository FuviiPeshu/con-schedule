import { css, styled } from "styled-components";

import { theme } from "../../styles/theme";

export const SchedulePageShell = styled.div<{ $filtersOpen: boolean }>`
    --schedule-sidebar-width: ${({ $filtersOpen }) => ($filtersOpen ? "320px" : "64px")};
    --schedule-scrollbar-width: 0px;

    display: grid;
    grid-template-columns: ${({ $filtersOpen }) =>
        $filtersOpen ? "320px minmax(0, 1fr)" : "64px minmax(0, 1fr)"};
    grid-template-areas: "aside content";
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    height: 100%;
    background: ${theme.surfaceBase};

    @media (max-width: 920px) {
        --schedule-sidebar-width: ${({ $filtersOpen }) => ($filtersOpen ? "220px" : "64px")};
        grid-template-columns: ${({ $filtersOpen }) =>
            $filtersOpen ? "220px minmax(0, 1fr)" : "64px minmax(0, 1fr)"};
    }

    @media (max-width: 680px) {
        --schedule-scrollbar-width: 0px;
        --schedule-sidebar-width: 0px;
        grid-template-areas:
            "aside"
            "content";
        grid-template-columns: 1fr;
        height: auto;
    }
`;

export const ScheduleContent = styled.div<{
    $calendarMode: boolean;
    $verticalScrollbarWidth: number;
}>`
    --schedule-scrollbar-width: ${({ $verticalScrollbarWidth }) => `${$verticalScrollbarWidth}px`};

    grid-area: content;
    overflow-x: hidden;
    overflow-y: auto;
    padding: ${({ $calendarMode }) => ($calendarMode ? "0" : "0 16px")};
    scrollbar-gutter: ${({ $verticalScrollbarWidth }) =>
        $verticalScrollbarWidth > 0 ? "stable" : "auto"};
    scrollbar-color: ${theme.primary} ${theme.surfaceBase};

    &::-webkit-scrollbar {
        width: 12px;
    }

    &::-webkit-scrollbar-track {
        background: ${theme.surfaceBase};
    }

    &::-webkit-scrollbar-thumb {
        border: 3px solid ${theme.surfaceBase};
        background: ${theme.primary};
    }

    ${({ $calendarMode }) =>
        $calendarMode &&
        css`
            display: block;
            overflow-x: hidden;
            overflow-y: auto;
        `}

    @media (max-width: 680px) {
        display: block;
        flex-direction: initial;
        min-height: auto;
        overflow: visible;
        padding: 0;
    }
`;

export const ScheduleBody = styled.div<{ $calendarMode: boolean }>`
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 100%;

    @media (max-width: 680px) {
        padding: ${({ $calendarMode }) => ($calendarMode ? "0" : "16px 20px")};
    }
`;

export const StatusText = styled.p`
    margin: 32px 0;
    color: ${theme.textAccent};
`;

export const ErrorBanner = styled.p`
    margin: 0 0 16px;
    color: ${theme.statusError};
`;
