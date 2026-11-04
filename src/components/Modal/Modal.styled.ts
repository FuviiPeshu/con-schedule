import { styled } from "styled-components";

import { theme } from "../../styles/theme";
import { ButtonComponent } from "../Button";

export const ModalDialog = styled.dialog`
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    width: 100vw;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    overflow: hidden;
    background: ${theme.surfaceDark}DD;
    color: ${theme.text};

    &:not([open]) {
        display: none;
    }
`;

export const ModalCloseButton = styled(ButtonComponent)`
    position: absolute;
    z-index: 1;
    top: 16px;
    right: 16px;
    background: ${theme.surfaceDark};
`;
