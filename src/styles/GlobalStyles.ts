import { createGlobalStyle } from "styled-components";

import { theme } from "./theme";

export const GlobalStyles = createGlobalStyle`
    *, *::before, *::after {
        box-sizing: border-box;
    }

    html, body, #root {
        min-height: 100%;
    }

    html, body {
        height: 100%;
    }

    body {
        margin: 0;
        background: ${theme.surfaceBase};
        color: ${theme.text};
        font-family: "Verdana", "Trebuchet MS", sans-serif;
        line-height: 1.2;
    }

    button, input, select, textarea {
        font: inherit;
    }

    ::selection {
        background: ${theme.primaryAction};
        color: ${theme.textAction};
    }
`;
