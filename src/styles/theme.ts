export const themeCommon = {
    white: "#ffffff",
    black: "#000000",
};

export const theme = {
    ...themeCommon,
    primary: "#4011f4",
    primaryDeep: "#230698",
    primaryAction: "#c5f411",
    primaryAccent: "#07fdb3",

    surfaceBase: "#0d0335",
    surfaceRaised: "#16064a",
    surfaceDark: "#08021f",
    surfaceHover: "#23069866",

    text: "#f7f4ff",
    textAccent: "#d9d0fb",
    textMuted: "#b6acd8",
    textSubtle: "#8f76f4",
    textHighlight: "#e8f9a4",
    textAction: "#0d0335",

    statusWarning: "#ff05cd",
    statusError: "#ff5d7a",
    statusOnline: "#07fdb3",
} as const;

export type Theme = typeof theme;
