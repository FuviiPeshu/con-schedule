import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { ModalCloseButton, ModalDialog } from "./Modal.styled";

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    label: string;
    closeLabel?: string;
    id?: string;
    children: ReactNode;
}

const openDialog = (dialog: HTMLDialogElement) => {
    if (dialog.open) {
        return;
    }

    if (typeof dialog.showModal === "function") {
        dialog.showModal();
    } else {
        // for tests
        dialog.setAttribute("open", "");
    }
};

const closeDialog = (dialog: HTMLDialogElement) => {
    if (!dialog.open) {
        return;
    }

    if (typeof dialog.close === "function") {
        dialog.close();
    } else {
        // for tests
        dialog.removeAttribute("open");
    }
};

export const ModalComponent = ({
    open,
    onClose,
    label,
    closeLabel = "Close",
    id,
    children,
}: ModalProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!open || !dialog) {
            return;
        }

        const previouslyFocused = document.activeElement;

        openDialog(dialog);

        return () => {
            closeDialog(dialog);

            if (previouslyFocused instanceof HTMLElement) {
                previouslyFocused.focus();
            }
        };
    }, [open]);

    return createPortal(
        <ModalDialog
            ref={dialogRef}
            id={id}
            aria-label={label}
            onClose={onClose}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    onClose();
                }
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            {open && (
                <>
                    <ModalCloseButton
                        variant="secondary"
                        size="l"
                        aria-label={closeLabel}
                        title={closeLabel}
                        onClick={onClose}
                    >
                        x
                    </ModalCloseButton>
                    {children}
                </>
            )}
        </ModalDialog>,
        document.body
    );
};
