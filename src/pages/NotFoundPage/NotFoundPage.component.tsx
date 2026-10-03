import { useLocation } from "react-router-dom";

import { BackArrow, BackLink, Heading, Page } from "./NotFoundPage.styled";

export const NotFoundPage = () => {
    const location = useLocation();

    const openedFromSchedule = location.state?.fromSchedule === true;

    return (
        <Page>
            <BackLink
                to={
                    openedFromSchedule
                        ? { pathname: "/", search: location.search }
                        : { pathname: "/", search: "" }
                }
                state={openedFromSchedule ? { fromSchedule: true } : { resetSchedule: true }}
            >
                <BackArrow aria-hidden="true">&lt;</BackArrow>
                Back to schedule
            </BackLink>
            <Heading>Page not found</Heading>
        </Page>
    );
};
