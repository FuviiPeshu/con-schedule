import { BackToScheduleLinkComponent } from "../../components/BackToScheduleLink";
import { Heading, Page } from "./NotFoundPage.styled";

export const NotFoundPage = () => (
    <Page>
        <BackToScheduleLinkComponent fallbackSearch="" />
        <Heading>Page not found</Heading>
    </Page>
);
