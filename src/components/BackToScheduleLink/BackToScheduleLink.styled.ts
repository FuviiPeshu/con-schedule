import { Link } from "react-router-dom";
import { styled } from "styled-components";

import { theme } from "../../styles/theme";

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
