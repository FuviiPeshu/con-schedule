import { Link } from "react-router-dom";
import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const Title = styled.h3`
    margin: 0 0 4px;
`;

export const Card = styled(Link)`
    display: block;
    padding: 8px 0;
    border-bottom: 1px solid ${theme.primaryDeep};
    color: ${theme.text};
    text-decoration: none;

    &:hover ${Title} {
        text-decoration: underline;
    }
`;

export const Pre = styled.pre`
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    color: ${theme.textMuted};
`;
