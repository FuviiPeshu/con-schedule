import { css, keyframes, styled } from "styled-components";

import { FeedState } from "../../schedule.types";
import { theme } from "../../styles/theme";

const feedPulse = keyframes`
    0%, 100% {
        opacity: 0.64;
        transform: scale(0.8);
    }

    50% {
        opacity: 1;
        transform: scale(1);
    }
`;

export const Shell = styled.div`
    height: 100vh;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: ${theme.surfaceBase};

    @media (max-width: 680px) {
        height: auto;
        overflow: visible;
    }
`;

export const Header = styled.header`
    position: relative;
    padding: 4px 32px 8px;
    background: ${theme.surfaceDark};

    &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 4px;
        background: ${theme.primaryAction};
        content: "";
    }
`;

export const HeaderInner = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;

    @media (max-width: 680px) {
        align-items: flex-start;
        flex-direction: column;
        gap: 16px;
    }
`;

export const Brand = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

export const BrandMark = styled.div`
    display: grid;
    place-items: center;
`;

export const BrandLogo = styled.img`
    width: 80px;
    height: 80px;
    display: "block";
    object-fit: contain;
`;

export const BrandText = styled.div`
    display: grid;
    gap: 8px;
`;

export const BrandTitle = styled.span`
    color: ${theme.primaryAccent};
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;

    span {
        color: ${theme.primaryAction};
    }
`;

export const BrandName = styled.span`
    color: ${theme.text};
    font-size: 1.2rem;
    font-weight: 800;

    span {
        color: ${theme.primaryAction};
    }
`;

export const HeaderMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    color: ${theme.textAccent};
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    @media (max-width: 680px) {
        width: 100%;
        flex-wrap: wrap;
        justify-content: space-between;
    }
`;

export const HeaderStatus = styled.span<{
    $state: FeedState;
}>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: ${({ $state }) => ($state === FeedState.Countdown ? theme.primaryAction : theme.text)};
`;

export const HeaderColumn = styled.span`
    display: grid;
    gap: 2px;
`;

export const HeaderColumnLabel = styled.span`
    color: ${theme.primaryAccent};
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

export const StatusDot = styled.span<{
    $state: FeedState;
}>`
    position: relative;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${({ $state }) =>
        $state === FeedState.Archive ? theme.statusError : theme.statusGood};

    ${({ $state }) =>
        $state === FeedState.Live
            ? css`
                  animation: ${feedPulse} 2s ease-in-out infinite;
              `
            : $state !== FeedState.Archive &&
              css`
                  display: none;
              `}
`;

export const HeaderMetaDivider = styled.span`
    color: ${theme.primaryAction};
`;

export const Main = styled.main`
    display: flex;
    flex: 1 1 auto;
    width: 100%;
    padding: 0;
    overflow: hidden;

    @media (max-width: 680px) {
        display: block;
        overflow: visible;
    }
`;
