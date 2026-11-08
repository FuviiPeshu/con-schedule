const maxAncestorDepth = 4;
const autoTitleAttribute = "data-truncation-title";

const isTruncationStyled = (style: CSSStyleDeclaration) => {
    const lineClamp = style.getPropertyValue("-webkit-line-clamp");

    return style.textOverflow === "ellipsis" || (lineClamp !== "" && lineClamp !== "none");
};

const isOverflowing = (element: HTMLElement) =>
    element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

/**
 * Sets a native `title` tooltip with the full text on the closest truncated element
 * (ellipsis or line clamp) at or above the target, and removes it again once the text fits.
 */
export const syncTruncationTitle = (target: EventTarget | null) => {
    let element = target instanceof HTMLElement ? target : null;

    for (let depth = 0; element && depth <= maxAncestorDepth; depth += 1) {
        const hasAutoTitle = element.hasAttribute(autoTitleAttribute);

        if (element.hasAttribute("title") && !hasAutoTitle) {
            return;
        }

        if (isTruncationStyled(getComputedStyle(element)) && isOverflowing(element)) {
            const text = element.textContent?.trim();

            if (text) {
                element.setAttribute("title", text);
                element.setAttribute(autoTitleAttribute, "");
            }

            return;
        }

        if (hasAutoTitle) {
            element.removeAttribute("title");
            element.removeAttribute(autoTitleAttribute);
        }

        element = element.parentElement;
    }
};
