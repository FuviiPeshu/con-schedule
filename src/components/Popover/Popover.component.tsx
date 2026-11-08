import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { containsNode } from "../../utils/dom.utils";
import { PopoverAnchor, PopoverPanel } from "./Popover.styled";
import type { PopoverAlign, PopoverPlacement } from "./Popover.styled";

export interface PopoverProps {
    open: boolean;
    onClose: () => void;
    label: string;
    trigger: ReactNode;
    children: ReactNode;
    id?: string;
    placement?: PopoverPlacement;
    align?: PopoverAlign;
}

export const PopoverComponent = ({
    open,
    onClose,
    label,
    trigger,
    children,
    id,
    placement = "below",
    align = "center",
}: PopoverProps) => {
    const anchorRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        const previouslyFocused = document.activeElement;
        const panel = panelRef.current;

        (panel?.querySelector<HTMLElement>("input") ?? panel)?.focus();

        const handlePointerDown = (event: PointerEvent) => {
            if (anchorRef.current && !containsNode(anchorRef.current, event.target)) {
                onCloseRef.current();
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                onCloseRef.current();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);

            // Focus is lost to <body> when the focused panel content unmounts; hand it back to the trigger
            if (
                (document.activeElement === document.body || document.activeElement === null) &&
                previouslyFocused instanceof HTMLElement
            ) {
                previouslyFocused.focus();
            }
        };
    }, [open]);

    return (
        <PopoverAnchor ref={anchorRef} $align={align}>
            {trigger}
            {open && (
                <PopoverPanel
                    ref={panelRef}
                    id={id}
                    role="dialog"
                    aria-label={label}
                    tabIndex={-1}
                    $placement={placement}
                    $align={align}
                >
                    {children}
                </PopoverPanel>
            )}
        </PopoverAnchor>
    );
};
