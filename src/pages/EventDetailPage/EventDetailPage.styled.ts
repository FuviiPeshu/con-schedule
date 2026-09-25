import { Link } from "react-router-dom";
import { styled } from "styled-components";

import { theme } from "../../styles/theme";

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

export const Panel = styled.article``;

export const Pre = styled.pre`
    white-space: pre-wrap;
    word-break: break-word;
    color: ${theme.textMuted};
`;
