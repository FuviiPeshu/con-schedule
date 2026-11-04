import { Link } from "react-router-dom";
import { styled } from "styled-components";

import { theme } from "../../styles/theme";
import { fontSize, typography } from "../../styles/typography";

export const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 16px;
    padding-bottom: 16px;
    color: ${theme.primaryAccent};
    cursor: pointer;
    ${typography.captionLabel}
    text-decoration: none;

    &:hover {
        color: ${theme.primaryAction};
    }
`;

export const BackArrow = styled.span`
    color: ${theme.primaryAction};
    font-size: ${fontSize.base};
`;
