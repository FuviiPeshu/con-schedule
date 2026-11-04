const breakpoint = {
    smallMobile: 420,
    mobile: 680,
    tablet: 920,
} as const;

const height = {
    short: 680,
    medium: 1000,
} as const;

export const mediaQuery = {
    smallMobile: `(max-width: ${breakpoint.smallMobile}px)`,
    mobile: `(max-width: ${breakpoint.mobile}px)`,
    tablet: `(max-width: ${breakpoint.tablet}px)`,
    shortScreen: `(max-height: ${height.short}px)`,
    desktopLowHeight: `(min-width: ${breakpoint.mobile + 1}px) and (max-height: ${height.medium}px)`,
} as const;

export const media = {
    smallMobile: `@media ${mediaQuery.smallMobile}`,
    mobile: `@media ${mediaQuery.mobile}`,
    tablet: `@media ${mediaQuery.tablet}`,
    shortScreen: `@media ${mediaQuery.shortScreen}`,
    desktopLowHeight: `@media ${mediaQuery.desktopLowHeight}`,
} as const;
