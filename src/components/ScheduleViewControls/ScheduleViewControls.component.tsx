import { ListDisplayMode, ScheduleView } from "../../schedule.types";
import {
    ViewControls,
    ViewOptionCheckbox,
    ViewOptionCheckboxInput,
    ViewToggleButton,
    ViewToggleContainer,
} from "./ScheduleViewControls.styled";

export const viewOptions = [
    { view: ScheduleView.List, label: "List" },
    { view: ScheduleView.Calendar, label: "Calendar" },
] as const;

interface ScheduleViewControlsProps {
    view: ScheduleView;
    onViewChange: (view: ScheduleView) => void;
    listDisplayMode: ListDisplayMode;
    onListDisplayModeChange: (mode: ListDisplayMode) => void;
}

export const ScheduleViewControlsComponent = ({
    view,
    onViewChange,
    listDisplayMode,
    onListDisplayModeChange,
}: ScheduleViewControlsProps) => (
    <ViewControls>
        <ViewToggleContainer role="group" aria-label="Schedule view">
            {viewOptions.map((option) => (
                <ViewToggleButton
                    key={option.view}
                    type="button"
                    $active={view === option.view}
                    aria-pressed={view === option.view}
                    onClick={() => onViewChange(option.view)}
                >
                    {option.label}
                </ViewToggleButton>
            ))}
        </ViewToggleContainer>
        {view === ScheduleView.List && (
            <ViewOptionCheckbox>
                <ViewOptionCheckboxInput
                    type="checkbox"
                    checked={listDisplayMode === ListDisplayMode.Compact}
                    onChange={(event) =>
                        onListDisplayModeChange(
                            event.target.checked ? ListDisplayMode.Compact : ListDisplayMode.Full
                        )
                    }
                />
                Compact view
            </ViewOptionCheckbox>
        )}
    </ViewControls>
);
