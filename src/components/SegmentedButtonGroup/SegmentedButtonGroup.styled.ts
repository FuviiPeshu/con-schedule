import { styled } from "styled-components";

import { borderWidth } from "../../styles/stylePrimitives";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";

export const SegmentedGroup = styled.div`
    display: inline-flex;
    flex: 0 0 auto;
    border: ${borderWidth.base} solid ${theme.primaryAction};
`;

export const SegmentedButton = styled.button<{ $active: boolean }>`
    padding: 8px 10px;
    border: 0;
    border-right: ${borderWidth.thin} solid ${theme.primaryDeep};
    background: ${({ $active }) => ($active ? theme.primaryDeep : theme.surfaceBase)};
    color: ${({ $active }) => ($active ? theme.text : theme.textSubtle)};
    cursor: pointer;
    ${typography.boldUppercaseLabel}

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
