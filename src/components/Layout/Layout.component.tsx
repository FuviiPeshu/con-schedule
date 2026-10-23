import { useEffect, useState } from "react";
import type { FC, PropsWithChildren } from "react";
import { formatInTimeZone } from "date-fns-tz";

import { conEnd, conId, conName, conStart, conTheme, conTimeZone } from "../../configuration";
import { FeedState } from "../../schedule.types";
import { formatCountdown, getFeedState, parseConventionDate } from "../../utils/dateTime.utils";
import {
    Brand,
    BrandLogo,
    BrandMark,
    BrandName,
    BrandText,
    BrandTitle,
    Header,
    HeaderColumn,
    HeaderColumnLabel,
    HeaderInner,
    HeaderMeta,
    HeaderMetaDivider,
    HeaderStatus,
    Main,
    Shell,
    StatusDot,
} from "./Layout.styled";

export const LayoutComponent: FC<PropsWithChildren> = ({ children }) => {
    const [currentTime, setCurrentTime] = useState(() => new Date());

    const feedState: FeedState = getFeedState(currentTime, conStart, conEnd);

    useEffect(() => {
        const intervalId = window.setInterval(() => setCurrentTime(new Date()), 1000);

        return () => window.clearInterval(intervalId);
    }, []);

    return (
        <Shell>
            <Header>
                <HeaderInner>
                    <Brand>
                        <BrandMark>
                            <BrandLogo
                                src={`${import.meta.env.BASE_URL}assets/header-logo.webp`}
                                alt="Logo"
                            />
                        </BrandMark>
                        <BrandText>
                            <BrandTitle>
                                {conName} <span>Schedule</span>
                            </BrandTitle>
                            <BrandName>
                                <span>{conId}:</span> {conTheme}
                            </BrandName>
                        </BrandText>
                    </Brand>
                    <HeaderMeta>
                        <HeaderStatus $state={feedState}>
                            <StatusDot $state={feedState} aria-hidden="true" />
                            <HeaderColumn>
                                <HeaderColumnLabel>
                                    {feedState === FeedState.Countdown ? "Starts in" : "Status"}
                                </HeaderColumnLabel>
                                {feedState === FeedState.Countdown
                                    ? formatCountdown(parseConventionDate(conStart), currentTime)
                                    : feedState}
                            </HeaderColumn>
                        </HeaderStatus>
                        <HeaderMetaDivider aria-hidden="true">/</HeaderMetaDivider>
                        <HeaderColumn>
                            <HeaderColumnLabel>Local time</HeaderColumnLabel>
                            <span>{formatInTimeZone(currentTime, conTimeZone, "HH:mm:ss")}</span>
                        </HeaderColumn>
                    </HeaderMeta>
                </HeaderInner>
            </Header>
            <Main>{children}</Main>
        </Shell>
    );
};
