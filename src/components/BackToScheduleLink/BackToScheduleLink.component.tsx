import { useLocation } from "react-router-dom";

import { getScheduleLinkProps } from "../../utils/navigation.utils";
import { BackArrow, BackLink } from "./BackToScheduleLink.styled";

interface BackToScheduleLinkProps {
    fallbackSearch: string;
}

export const BackToScheduleLinkComponent = ({ fallbackSearch }: BackToScheduleLinkProps) => {
    const location = useLocation();

    return (
        <BackLink {...getScheduleLinkProps(location.state, location.search, fallbackSearch)}>
            <BackArrow aria-hidden="true">&lt;</BackArrow>
            Back to schedule
        </BackLink>
    );
};
