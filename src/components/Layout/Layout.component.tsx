import type { ReactNode } from "react";

import { conId, conName } from "../../configuration";
import { Brand, Header, Main, Shell } from "./Layout.styled";

export const Layout = ({ children }: { children: ReactNode }) => (
    <Shell>
        <Header>
            <Brand>
                {conName}: <span>{conId} Schedule</span>
            </Brand>
        </Header>
        <Main>{children}</Main>
    </Shell>
);
