export type JsonPrimitive = boolean | null | number | string

export type JsonObject = { [key: string]: JsonValue }

export type JsonArray = JsonValue[]

export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export interface Thread {
    id: string;
    created_at: number;
}

export interface User {
    id: string;
    created_at: number;
}

export interface ThreadEntry {
    url: string;
    data: ThreadPayload;
    created_utc: number;
}

export interface ThreadPayload {
    h: Array<[ string, string ]>;
    c: string[];
}

export interface KeychainEntry {
    url: string;
    data: KeychainPayload;
    created_utc?: number;
}

export interface KeychainPayload {
    a: KeychainPayloadStorages;
    b: string[];
    c: string[];
}

export interface KeychainPayloadStorages {
    l: Record<string, string>;
    s: Record<string, string>;
}

export type CookieStore = Cookie[];

export interface Cookie {
    domain: string
    expirationDate?: number
    hostOnly: boolean
    httpOnly: boolean
    name: string
    path: string
    sameSite: string
    secure: boolean
    session: boolean
    storeId: string
    value: string
}

export interface ThreadXhrStreamEntry {
    url: string;
    data: ThreadXhrStreamPayload;
    created_utc?: number;
}

export interface ThreadXhrStreamPayload {
    raw?: string[];
    formData?: string;
}