export const borderWidth = {
    thin: "1px",
    base: "2px",
    medium: "3px",
    thick: "4px",
} as const;
export type BorderWidth = keyof typeof borderWidth;

export const duration = {
    fast: "160ms",
    base: "256ms",
    slow: "500ms",
    pulse: "2s",
} as const;
export type Duration = keyof typeof duration;

export const easing = {
    standard: "ease",
    out: "ease-out",
    inOut: "ease-in-out",
} as const;
export type Easing = keyof typeof easing;

interface TransitionParams {
    properties: string | readonly string[];
    duration?: Duration;
    easing?: Easing;
}

export const transition = ({
    properties,
    duration: speed = "base",
    easing: curve = "standard",
}: TransitionParams) =>
    `transition: ${[properties]
        .flat()
        .map((property) => `${property} ${duration[speed]} ${easing[curve]}`)
        .join(", ")};`;
