// import { themeEF31 } from "./themeEF31";

export const themeCommon = {
    white: "#ffffff",
    black: "#000000",
};

export const themeBase = {
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
    statusGood: "#33CC14",
} as const;
export type Theme = Record<keyof typeof themeBase, string>;

export const theme = {
    ...themeCommon,
    ...themeBase,
    // ...themeEF31,
};
