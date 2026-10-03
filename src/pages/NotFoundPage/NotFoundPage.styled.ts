import { Link } from "react-router-dom";
import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const Page = styled.div`
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

export const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 16px;
    padding-bottom: 16px;
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

export const Heading = styled.h1`
    border-top: 4px solid ${theme.primaryAction};
    margin: 0;
    padding: 64px 16px;
    color: ${theme.text};
    font-size: 4.4rem;
    font-weight: 800;
    line-height: 1;
    text-align: center;

    @media (max-width: 680px) {
        font-size: 3rem;
    }
`;