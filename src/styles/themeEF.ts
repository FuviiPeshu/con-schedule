import { themeCommon } from "./theme";

export const themeEF = {
    ...themeCommon,
    primary: "#00504a",
    primaryDeep: "#00504a",
    primaryAction: "#ffd700",
    primaryAccent: "#7faca9",

    surfaceBase: "#262c2c",
    surfaceRaised: "#262c2c",
    surfaceDark: "#000000",
    surfaceHover: "#404f4f40",

    text: "#e5eeed",
    textAccent: "#D4DBDA",
    textMuted: "#D4DBDA",
    textSubtle: "#7faca9",
    textHighlight: "#ffd700",
    textAction: "#001a18",

    statusWarning: "#ee5e22",
    statusError: "#b21542",
    statusOnline: "#00504a",
} as const;

export type ThemeEF = typeof themeEF;
