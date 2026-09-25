import { BackLink, Page } from "./NotFoundPage.styled";

export const NotFoundPage = () => (
    <Page>
        <h1>Page not found</h1>
        <BackLink to="/">Back to schedule</BackLink>
    </Page>
);
