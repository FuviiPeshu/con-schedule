import { styled } from "styled-components";

import { media } from "../../styles/media";
import { borderWidth } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { fontSize, typography } from "../../styles/typography";

export const Page = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    min-height: 100%;
    overflow: auto;
    padding: 16px 0 0;

    ${media.mobile} {
        & > a {
            margin-left: 24px;
        }
    }
`;

export const Heading = styled.h1`
    border-top: ${borderWidth.thick} solid ${theme.primaryAction};
    margin: 0;
    padding: 64px 16px;
    color: ${theme.text};
    ${typography.displayHeading}
    text-align: center;

    ${media.mobile} {
        font-size: ${fontSize.big};
    }
`;
