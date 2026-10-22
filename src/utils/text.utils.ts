import DOMPurify from "dompurify";
import parse from "html-react-parser";

const embeddedMarkdownHrefPattern = /href=(['"])\[url\]\((https?:\/\/[^)'"\s]+)\)\1/gi;

/** Normalizes embedded Markdown links in HTML */
const normalizeEmbeddedMarkdownLinks = (value: string): string =>
    value.replace(
        embeddedMarkdownHrefPattern,
        (_match, quote: string, url: string) => `href=${quote}${url}${quote}`
    );

/** Normalizes string (trims whitespace and converts it to lowercase) */
export const normalizeText = (value: string): string => value.trim().toLocaleLowerCase();

/** Sanitizes HTML before converting it to React elements */
export const renderEventHtml = (value: string): ReturnType<typeof parse> =>
    parse(DOMPurify.sanitize(normalizeEmbeddedMarkdownLinks(value)));
