import { styled } from "styled-components";

import { theme } from "../../styles/theme";

export const Shell = styled.div``;

export const Header = styled.header`
    padding: 16px;
    background: ${theme.black};
    border-bottom: 4px solid ${theme.primary};
`;

export const Brand = styled.span`
    font-weight: 700;

    span {
        color: ${theme.primary};
    }
`;

export const Main = styled.main`
    padding: 16px;
`;
