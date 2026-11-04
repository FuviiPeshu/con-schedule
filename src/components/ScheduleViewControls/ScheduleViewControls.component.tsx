import { ListDisplayMode, ScheduleView } from "../../schedule.types";
import { CheckboxComponent } from "../Checkbox";
import { SegmentedButtonGroupComponent } from "../SegmentedButtonGroup";
import { ViewControls } from "./ScheduleViewControls.styled";

const viewOptions = [
    { value: ScheduleView.List, label: "List" },
    { value: ScheduleView.Calendar, label: "Calendar" },
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
        <SegmentedButtonGroupComponent
            aria-label="Schedule view"
            options={viewOptions}
            value={view}
            onChange={onViewChange}
        />
        {view === ScheduleView.List && (
            <CheckboxComponent
                label="Compact view"
                checked={listDisplayMode === ListDisplayMode.Compact}
                onChange={(checked) =>
                    onListDisplayModeChange(
                        checked ? ListDisplayMode.Compact : ListDisplayMode.Full
                    )
                }
            />
        )}
    </ViewControls>
);
