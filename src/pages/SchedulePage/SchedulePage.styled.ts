import { css, styled } from "styled-components";

import { theme } from "../../styles/theme";

export const PageHeader = styled.header<{ $calendarMode?: boolean }>`
    display: grid;
    gap: 8px;
    margin: 0;
    padding-bottom: 16px;

    ${({ $calendarMode }) =>
        $calendarMode &&
        css`
            padding: 16px;
        `}

    @media (max-width: 680px) {
        ${({ $calendarMode }) =>
            $calendarMode &&
            css`
                padding: 20px;
            `}
    }
`;

export const PageHeaderNavigationBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
`;

export const PageBreadcrumbsWrapper = styled.span`
    color: ${theme.primaryAction};
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

export const ViewToggleContainer = styled.div`
    display: inline-flex;
    flex: 0 0 auto;
    border: 2px solid ${theme.primaryAction};
`;

export const ViewToggleButton = styled.button<{ $active: boolean }>`
    padding: 6px 8px;
    border: 0;
    border-right: 1px solid ${theme.primaryDeep};
    background: ${({ $active }) => ($active ? theme.primaryDeep : theme.surfaceBase)};
    color: ${({ $active }) => ($active ? theme.text : theme.textSubtle)};
    cursor: pointer;
    font-size: 0.64rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    &:last-child {
        border-right: 0;
    }

    &:not(:disabled):hover {
        color: ${theme.primaryAction};
    }

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;

export const PageTitle = styled.h1`
    margin: 0;
    color: ${theme.text};
    font-size: 4.8rem;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1;

    @media (max-width: 680px) {
        font-size: 3rem;
    }
`;

export const PageTitleAccent = styled.span`
    color: ${theme.primaryAction};
`;

export const PageSummary = styled.p`
    margin: 8px 0 0;
    color: ${theme.textMuted};
    font-size: 1rem;
`;

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

export const FilterAside = styled.aside<{ $collapsed: boolean }>`
    grid-area: aside;
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${theme.primaryDeep};
    color: ${theme.text};
    background: ${theme.surfaceDark};
    padding: 24px 20px 32px;

    ${({ $collapsed }) =>
        $collapsed &&
        css`
            width: 64px;
            padding-right: 8px;
            padding-left: 8px;
        `}

    @media (max-width: 680px) {
        display: block;
        width: 100%;
        min-height: auto;
        border-right: 0;
        border-bottom: 2px solid ${theme.primaryAction};
    }
`;

export const FilterBody = styled.div`
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    padding-top: 16px;
`;

export const ScheduleContent = styled.div<{
    $calendarMode: boolean;
    $verticalScrollbarWidth: number;
}>`
    --schedule-scrollbar-width: ${({ $verticalScrollbarWidth }) => `${$verticalScrollbarWidth}px`};

    grid-area: content;
    overflow-x: hidden;
    overflow-y: auto;
    padding: ${({ $calendarMode }) => ($calendarMode ? "0" : "16px")};
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
    min-width: 0;

    ${({ $calendarMode }) =>
        $calendarMode &&
        css`
            display: block;
        `}

    @media (max-width: 680px) {
        padding: ${({ $calendarMode }) => ($calendarMode ? "0" : "16px 20px")};
    }
`;

export const FilterHeader = styled.div<{ $collapsed: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;

    ${({ $collapsed }) =>
        $collapsed &&
        css`
            justify-content: center;
        `}
`;

export const FilterPanelTitle = styled.h2`
    display: block;
    margin: 0;
    color: ${theme.primaryAction};
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    @media (max-width: 920px) {
        font-size: 1.2rem;
        letter-spacing: 0.04em;
    }
`;

export const CollapseButton = styled.button`
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 2px solid ${theme.primaryDeep};
    background: transparent;
    color: ${theme.text};
    cursor: pointer;

    &:hover {
        border-color: ${theme.primaryAction};
        color: ${theme.primaryAction};
    }

    @media (max-width: 920px) {
        width: 42px;
        height: 42px;
    }

    @media (max-width: 680px) {
        display: none;
        user-select: none;
        pointer-events: none;
    }
`;

export const CollapseIcon = styled.span`
    font-size: 1.1rem;
    line-height: 1;

    @media (max-width: 920px) {
        font-size: 1.28rem;
    }
`;

export const FilterControls = styled.div`
    display: grid;
    gap: 16px;

    @media (min-width: 681px) and (max-height: 1000px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;

        > label:first-child,
        > button {
            grid-column: 1 / -1;
        }
    }
`;

export const ResetButton = styled.button`
    margin-top: 16px;
    padding: 8px 10px;
    border: 2px solid ${theme.primaryAction};
    background: ${theme.primaryAction};
    color: ${theme.textAction};
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-align: center;
    text-transform: uppercase;
    cursor: pointer;

    &:not(:disabled):hover {
        border-color: ${theme.primaryAction};
        background: ${theme.surfaceHover};
        color: ${theme.primaryAction};
    }

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;

export const SchedulePanel = styled.section`
    min-width: 0;
`;

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

export const StatusText = styled.p`
    margin: 32px 0;
    color: ${theme.textAccent};
`;

export const ErrorBanner = styled.p`
    margin: 0 0 16px;
    color: ${theme.statusError};
`;
