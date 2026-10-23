import type { CalendarDay } from "../../schedule.types";
import { CalendarDayButton, CalendarDayLabel, CalendarDaySelector } from "./CalendarView.styled";

interface CalendarDayTabsProps {
    days: CalendarDay[];
    activeDay: string;
    disabledDays: ReadonlySet<string>;
    onSelectDay: (day: string) => void;
}

export const CalendarDayTabsComponent = ({
    days,
    activeDay,
    disabledDays,
    onSelectDay,
}: CalendarDayTabsProps) => (
    <CalendarDaySelector role="tablist" aria-label="Schedule days">
        {days.map((day) => {
            const isDisabled = disabledDays.has(day.value);

            return (
                <CalendarDayButton
                    $active={day.value === activeDay}
                    $disabled={isDisabled}
                    key={day.value}
                    type="button"
                    role="tab"
                    aria-label={`${day.label} ${day.eventsCount} events`}
                    aria-selected={day.value === activeDay}
                    aria-disabled={isDisabled}
                    disabled={isDisabled}
                    onClick={() => onSelectDay(day.value)}
                >
                    <CalendarDayLabel>{day.label}</CalendarDayLabel>
                    <span>{day.eventsCount} events</span>
                </CalendarDayButton>
            );
        })}
    </CalendarDaySelector>
);
