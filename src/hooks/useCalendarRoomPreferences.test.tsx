import type { KeyboardEvent, PointerEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { conId } from "../configuration";
import {
    roomWidthMax,
    roomWidthMin,
    roomWidthStep,
    useCalendarRoomPreferences,
} from "./useCalendarRoomPreferences";

const hiddenRoomsKey = `con-schedule:${conId}:calendar:hidden-rooms`;
const roomWidthsKey = `con-schedule:${conId}:calendar:room-widths`;

const readStored = (key: string) => JSON.parse(window.localStorage.getItem(key) ?? "null");

const keyEvent = (key: string) =>
    ({ key, preventDefault: vi.fn() }) as unknown as KeyboardEvent<HTMLButtonElement> & {
        preventDefault: ReturnType<typeof vi.fn>;
    };

const pointerEvent = (pointerId: number, clientX: number) => {
    const currentTarget = {
        focus: vi.fn(),
        setPointerCapture: vi.fn(),
        releasePointerCapture: vi.fn(),
    };

    return {
        pointerId,
        clientX,
        currentTarget,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
    } as unknown as PointerEvent<HTMLButtonElement> & { currentTarget: typeof currentTarget };
};

describe("Hooks / useCalendarRoomPreferences", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should hide and show rooms and persist the choice", () => {
        const { result } = renderHook(() => useCalendarRoomPreferences());

        act(() => result.current.toggleRoom("Auditorium"));
        expect(result.current.hiddenRoomSet.has("Auditorium")).toBe(true);
        expect(readStored(hiddenRoomsKey)).toEqual(["Auditorium"]);

        act(() => result.current.toggleRoom("Auditorium"));
        expect(result.current.hiddenRoomSet.has("Auditorium")).toBe(false);
        expect(readStored(hiddenRoomsKey)).toEqual([]);
    });

    it("should restore stored hidden rooms and drop non-string entries", () => {
        window.localStorage.setItem(hiddenRoomsKey, JSON.stringify(["Auditorium", 7, null]));

        const { result } = renderHook(() => useCalendarRoomPreferences());

        expect(result.current.hiddenRooms).toEqual(["Auditorium"]);
    });

    it("should ignore stored hidden rooms that are not a list", () => {
        window.localStorage.setItem(hiddenRoomsKey, '{"a":1}');

        const { result } = renderHook(() => useCalendarRoomPreferences());

        expect(result.current.hiddenRooms).toEqual([]);
    });

    it("should clamp and sanitize stored room widths", () => {
        window.localStorage.setItem(
            roomWidthsKey,
            JSON.stringify({ Small: 10, Large: 9000, Fine: 300, Text: "wide", Nothing: null })
        );

        const { result } = renderHook(() => useCalendarRoomPreferences());

        expect(result.current.roomWidthOverrides).toEqual({
            Small: roomWidthMin,
            Large: roomWidthMax,
            Fine: 300,
        });
    });

    it("should resize with arrow keys in fixed steps and persist the width", () => {
        const { result } = renderHook(() => useCalendarRoomPreferences());
        const right = keyEvent("ArrowRight");

        act(() => result.current.resizeRoomWithKeyboard(right, "Auditorium", 256));

        expect(right.preventDefault).toHaveBeenCalled();
        expect(result.current.roomWidthOverrides.Auditorium).toBe(256 + roomWidthStep);
        expect(readStored(roomWidthsKey)).toEqual({ Auditorium: 256 + roomWidthStep });

        act(() => result.current.resizeRoomWithKeyboard(keyEvent("ArrowLeft"), "Auditorium", 256));
        expect(result.current.roomWidthOverrides.Auditorium).toBe(256 - roomWidthStep);
    });

    it("should jump to the limits with Home and End and never exceed them", () => {
        const { result } = renderHook(() => useCalendarRoomPreferences());

        act(() => result.current.resizeRoomWithKeyboard(keyEvent("Home"), "Room", 300));
        expect(result.current.roomWidthOverrides.Room).toBe(roomWidthMin);

        act(() => result.current.resizeRoomWithKeyboard(keyEvent("End"), "Room", 300));
        expect(result.current.roomWidthOverrides.Room).toBe(roomWidthMax);

        act(() =>
            result.current.resizeRoomWithKeyboard(keyEvent("ArrowRight"), "Room", roomWidthMax)
        );
        expect(result.current.roomWidthOverrides.Room).toBe(roomWidthMax);

        act(() =>
            result.current.resizeRoomWithKeyboard(keyEvent("ArrowLeft"), "Room", roomWidthMin)
        );
        expect(result.current.roomWidthOverrides.Room).toBe(roomWidthMin);
    });

    it("should resize while dragging the handle and stop when released", () => {
        const { result } = renderHook(() => useCalendarRoomPreferences());
        const start = pointerEvent(1, 100);

        act(() => result.current.startRoomResize(start, "Room", 300));
        expect(start.currentTarget.setPointerCapture).toHaveBeenCalledWith(1);
        expect(start.preventDefault).toHaveBeenCalled();

        act(() => result.current.moveRoomResize(pointerEvent(1, 150)));
        expect(result.current.roomWidthOverrides.Room).toBe(350);

        act(() => result.current.moveRoomResize(pointerEvent(1, 5000)));
        expect(result.current.roomWidthOverrides.Room).toBe(roomWidthMax);

        const end = pointerEvent(1, 150);
        act(() => result.current.finishRoomResize(end));
        expect(end.currentTarget.releasePointerCapture).toHaveBeenCalledWith(1);

        act(() => result.current.moveRoomResize(pointerEvent(1, 0)));
        expect(result.current.roomWidthOverrides.Room).toBe(roomWidthMax);
    });
});
