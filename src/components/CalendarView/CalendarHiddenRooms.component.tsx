import { CalendarOrientation } from "../../schedule.types";
import type { CalendarRoom } from "../../schedule.types";
import {
    CalendarHiddenRoom,
    CalendarRoomControls,
    CalendarRoomControlsLabel,
    CalendarRoomHide,
} from "./CalendarView.styled";

interface CalendarHiddenRoomsProps {
    rooms: CalendarRoom[];
    orientation: CalendarOrientation;
    onShowRoom: (roomName: string) => void;
}

export const CalendarHiddenRoomsComponent = ({
    rooms,
    orientation,
    onShowRoom,
}: CalendarHiddenRoomsProps) =>
    rooms.length > 0 ? (
        <CalendarRoomControls
            aria-label={
                orientation === CalendarOrientation.Rooms
                    ? "Hidden room columns"
                    : "Hidden room rows"
            }
        >
            <CalendarRoomControlsLabel>Hidden rooms</CalendarRoomControlsLabel>
            {rooms.map((room) => (
                <CalendarHiddenRoom key={room.value} title={room.label}>
                    <span>{room.label}</span>
                    <CalendarRoomHide
                        $compact
                        type="button"
                        aria-label={`Show ${room.label}`}
                        title={`Show ${room.label}`}
                        onClick={() => onShowRoom(room.value)}
                    >
                        x
                    </CalendarRoomHide>
                </CalendarHiddenRoom>
            ))}
        </CalendarRoomControls>
    ) : null;
