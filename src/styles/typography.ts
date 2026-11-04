import { css } from "styled-components";

export const fontSize = {
    xxs: "0.5rem",
    xs: "0.55rem",
    s: "0.64rem",
    m: "0.8rem",
    base: "1rem",
    l: "1.1rem",
    xl: "1.2rem",
    xxl: "1.28rem",
    display: "1.4rem",
    title: "2rem",
    big: "3rem",
    giant: "4.4rem",
} as const;
export type FontSize = keyof typeof fontSize;

export const fontWeight = {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
} as const;
export type FontWeight = keyof typeof fontWeight;

export const lineHeight = {
    none: 1,
    tight: 1.2,
    relaxed: 1.4,
} as const;
export type LineHeight = keyof typeof lineHeight;

export const letterSpacing = {
    none: "0",
    xs: "0.02em",
    s: "0.04em",
    m: "0.06em",
    l: "0.08em",
} as const;
export type LetterSpacing = keyof typeof letterSpacing;

interface TextStyleParams {
    size?: FontSize;
    weight?: FontWeight;
    lineHeight?: LineHeight;
    spacing?: LetterSpacing;
    uppercase?: boolean;
}

export const textStyle = ({
    size,
    weight,
    lineHeight: height,
    spacing,
    uppercase,
}: TextStyleParams) => css`
    ${size ? `font-size: ${fontSize[size]};` : ""}
    ${weight ? `font-weight: ${fontWeight[weight]};` : ""}
    ${height ? `line-height: ${lineHeight[height]};` : ""}
    ${spacing ? `letter-spacing: ${letterSpacing[spacing]};` : ""}
    ${uppercase ? "text-transform: uppercase;" : ""}
`;

export const typography = {
    captionLabel: textStyle({ size: "s", spacing: "l", uppercase: true }),
    uppercaseLabel: textStyle({ size: "m", spacing: "l", uppercase: true }),
    boldUppercaseLabel: textStyle({ size: "m", weight: "bold", spacing: "l", uppercase: true }),
    boldUppercaseHeading: textStyle({
        size: "base",
        weight: "bold",
        spacing: "l",
        uppercase: true,
    }),
    displayHeading: textStyle({ size: "giant", weight: "extrabold", lineHeight: "none" }),
} as const;
