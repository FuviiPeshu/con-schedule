export const theme = {
    primary: "#00504a",
    secondary: "#7faca9",
    background: "#262c2c",
    black: "#000000",
    white: "#ffffff",
    text: "#e5eeed",
    textSecondary: "#D4DBDA",
    warning: "#ee5e22",
    error: "#b21542",
    darken: "#404f4f40",
    lighten: "#f7f7f780",
    soften: "#f7f7f7a0",
    superSponsor: "#5300ff",
    superSponsorText: "#fff7f0",
    sponsor: "#ffd700",
    sponsorText: "#001a18",
    staff: "#ec661f",
    staffText: "#fff7f0",
} as const;

export type Theme = typeof theme;
