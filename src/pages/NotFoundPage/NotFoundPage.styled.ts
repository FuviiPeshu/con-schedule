import { Link } from "react-router-dom";
import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const Page = styled.div`
    padding: 32px 64px;
`;

export const BackLink = styled(Link)`
    background: none;
    border: none;
    color: ${theme.primaryAction};
    cursor: pointer;
    margin-bottom: 16px;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;
