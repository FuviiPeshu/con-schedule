import type { EventSlot, ScheduleResponse } from "../api";

export const EXAMPLE_EVENT_MOCK_DATA: EventSlot = {
    id: 621,
    guid: "a502030-1a6e-5e97-a62a-c11a6ee9a93d",
    code: "6932DD",
    stable_id: "6932DD@2026-08-20T16:50",
    title: "Opening Ceremony",
    abstract: "<p>The official start of Eurofurence!</p>",
    description: "<p>The official start of Eurofurence!</p>",
    raw_abstract: "The official start of Eurofurence!",
    raw_description: "The official start of Eurofurence!",
    start: "2026-08-20T16:50:00+02:00",
    end: "2026-08-20T17:20:00+02:00",
    duration: 30,
    image: null,
    submission_type: "Talk",
    room: { id: 1, name: "Auditorium" },
    track: { id: 6, name: "Performance", color: "#42d4f4" },
    speakers: [
        { code: "SPEAK1", name: "Conops", avatar: null },
        { code: "SPEAK2", name: "John Eurofurence", avatar: null },
    ],
    tags: [{ id: 22, tag: "Information" }],
    is_blocker: false,
    slot_index: 0,
};

export const OTHER_EXAMPLE_EVENT_MOCK_DATA: EventSlot = {
    id: 30422,
    guid: "082c29c2-6152-5e4f-8dfd-bb14d357ed0a",
    code: "PBUNHA",
    stable_id: "PBUNHA@2026-08-21T10:00",
    title: "Fursuit Lounge - Fri",
    abstract: "<p>Relax and cool down.</p>",
    description: "<p>Relax and cool down.</p>",
    raw_abstract: "Relax and cool down.",
    raw_description: "Relax and cool down.",
    start: "2026-08-21T10:00:00+02:00",
    end: "2026-08-22T02:00:00+02:00",
    duration: 960,
    image: null,
    submission_type: "Half Day",
    room: { id: 10, name: "Fursuit Lounge" },
    track: { id: 1, name: "EF-Services", color: "#ffe4c4" },
    speakers: [],
    tags: [{ id: 1, tag: "EF-Services" }],
    is_blocker: false,
    slot_index: 0,
};

export const SCHEDULE_MOCK_DATA: ScheduleResponse = {
    event: { name: "Eurofurence 30", slug: "eurofurence-30" },
    schedule_version: "0.1",
    tags: [{ id: 22, tag: "Information", color: "#42d4f4" }],
    tracks: [
        { id: 1, name: "EF-Services", color: "#ffe4c4" },
        { id: 6, name: "Performance", color: "#42d4f4" },
    ],
    rooms: [
        { id: 1, name: "Auditorium", position: 0 },
        { id: 10, name: "Fursuit Lounge", position: 1 },
    ],
    speakers: [
        { code: "SPEAK1", name: "Conops", avatar: null, biography: null },
        {
            code: "SPEAK2",
            name: "John Eurofurence",
            avatar: null,
            biography: "John Eurofurence is real!",
        },
    ],
    days: [
        {
            date: "2026-08-20",
            label: "Thursday, August 20",
            slots: [EXAMPLE_EVENT_MOCK_DATA],
        },
        {
            date: "2026-08-21",
            label: "Friday, August 21",
            slots: [OTHER_EXAMPLE_EVENT_MOCK_DATA],
        },
    ],
    imprint_url: "https://example.com/imprint",
    privacy_url: "https://example.com/privacy",
};
