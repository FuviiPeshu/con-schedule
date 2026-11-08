import { useEffect } from "react";

import { syncTruncationTitle } from "../utils/truncation.utils";

/** Adds full-text tooltips to any truncated text on hover or keyboard focus available in the app (document scope) */
export const useTruncationTooltips = () => {
    useEffect(() => {
        const handleInteraction = (event: Event) => syncTruncationTitle(event.target);

        document.addEventListener("mouseover", handleInteraction);
        document.addEventListener("focusin", handleInteraction);

        return () => {
            document.removeEventListener("mouseover", handleInteraction);
            document.removeEventListener("focusin", handleInteraction);
        };
    }, []);
};
