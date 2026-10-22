import { useMemo, useRef } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

import { conId } from "../configuration";
import { usePersistedState } from "./usePersistedState";

const hiddenRoomsStorageKey = `con-schedule:${conId}:calendar:hidden-rooms`;
const roomWidthsStorageKey = `con-schedule:${conId}:calendar:room-widths`;

export const roomWidthMin = 160;
export const roomWidthMax = 560;
export const roomWidthStep = 10;

const clampRoomWidth = (width: number) => Math.min(roomWidthMax, Math.max(roomWidthMin, width));

/** Maps a resize-handle key press to the new column width, or null for unrelated keys */
const getKeyboardResizeWidth = (key: string, width: number): number | null => {
    switch (key) {
        case "ArrowLeft":
            return width - roomWidthStep;
        case "ArrowRight":
            return width + roomWidthStep;
        case "Home":
            return roomWidthMin;
        case "End":
            return roomWidthMax;
        default:
            return null;
    }
};

const parseHiddenRooms = (stored: unknown): string[] =>
    Array.isArray(stored) ? stored.filter((room): room is string => typeof room === "string") : [];

const parseRoomWidths = (stored: unknown): Record<string, number> => {
    if (typeof stored !== "object" || stored === null || Array.isArray(stored)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(stored).flatMap(([roomName, width]) =>
            typeof width === "number" && Number.isFinite(width)
                ? [[roomName, clampRoomWidth(width)]]
                : []
        )
    );
};

type RoomResizeGesture = {
    roomName: string;
    pointerId: number;
    startX: number;
    startWidth: number;
};

/** Persisted per-room calendar preferences: which rooms are hidden and how wide each column is */
export const useCalendarRoomPreferences = () => {
    const [hiddenRooms, setHiddenRooms] = usePersistedState(
        hiddenRoomsStorageKey,
        parseHiddenRooms
    );
    const [roomWidthOverrides, setRoomWidthOverrides] = usePersistedState(
        roomWidthsStorageKey,
        parseRoomWidths
    );
    const hiddenRoomSet = useMemo(() => new Set(hiddenRooms), [hiddenRooms]);
    const resizeRef = useRef<RoomResizeGesture | null>(null);

    const toggleRoom = (roomName: string) => {
        setHiddenRooms((currentHiddenRooms) =>
            currentHiddenRooms.includes(roomName)
                ? currentHiddenRooms.filter((currentRoom) => currentRoom !== roomName)
                : [...currentHiddenRooms, roomName]
        );
    };

    const updateRoomWidth = (roomName: string, width: number) => {
        setRoomWidthOverrides((currentWidths) => ({
            ...currentWidths,
            [roomName]: clampRoomWidth(width),
        }));
    };

    const startRoomResize = (
        event: PointerEvent<HTMLButtonElement>,
        roomName: string,
        width: number
    ) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        resizeRef.current = {
            roomName,
            pointerId: event.pointerId,
            startX: event.clientX,
            startWidth: width,
        };
    };

    const moveRoomResize = (event: PointerEvent<HTMLButtonElement>) => {
        const resize = resizeRef.current;

        if (resize?.pointerId === event.pointerId) {
            updateRoomWidth(resize.roomName, resize.startWidth + event.clientX - resize.startX);
        }
    };

    const finishRoomResize = (event: PointerEvent<HTMLButtonElement>) => {
        if (resizeRef.current?.pointerId === event.pointerId) {
            resizeRef.current = null;
            event.currentTarget.releasePointerCapture?.(event.pointerId);
        }
    };

    const resizeRoomWithKeyboard = (
        event: KeyboardEvent<HTMLButtonElement>,
        roomName: string,
        width: number
    ) => {
        const nextWidth = getKeyboardResizeWidth(event.key, width);

        if (nextWidth !== null) {
            event.preventDefault();
            updateRoomWidth(roomName, nextWidth);
        }
    };

    return {
        hiddenRooms,
        hiddenRoomSet,
        roomWidthOverrides,
        toggleRoom,
        startRoomResize,
        moveRoomResize,
        finishRoomResize,
        resizeRoomWithKeyboard,
    };
};
