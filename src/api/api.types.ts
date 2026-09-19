// Types from public Eurofurence schedule API

export type RoomRef = {
    id: number | null;
    name: string;
};

export type TrackRef = {
    id: number;
    name: string;
    color: string;
};

export type SpeakerRef = {
    code: string;
    name: string;
    avatar: string | null;
};

export type TagRef = {
    id: number;
    tag: string;
};

export type EventSlot = {
    id: number;
    guid: string;
    code: string;
    stable_id: string;
    title: string;
    abstract: string;
    description: string;
    raw_abstract: string;
    raw_description: string;
    start: string | null; // ISO datetime with timezone offset or null
    end: string | null; // ISO datetime with timezone offset or null
    duration: number; // in minutes
    image: string | null;
    submission_type: string;
    room: RoomRef;
    track: TrackRef;
    speakers: SpeakerRef[];
    tags: TagRef[];
};

export type ScheduleDay = {
    date: string;
    label: string;
    slots: EventSlot[];
};

export type ScheduleResponse = {
    days: ScheduleDay[];
    event: { name: string; slug: string };
    rooms: { id: number; name: string; position: number }[];
    tracks: TrackRef[];
    schedule_version: string;
};
