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

type CookieType = Parameters<typeof chrome.cookies.set>[0];

export type CookieStore = Cookie[];

export interface Cookie {
    domain: string;
    name: string;
    storeId: string;
    value: string;
    session: boolean;
    hostOnly: boolean;
    expirationDate?: number | undefined;
    path: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: CookieType['sameSite'];
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

export interface ThreadActionTypingEntry {
    url: string;
    data: ThreadActionTypingPayload;
    created_utc?: number;
}

export interface ThreadActionTypingPayload {
    text: string;
}

export interface ThreadActionInteractionEntry {
    url: string;
    data: ThreadActionInteractionPayload;
    created_utc?: number;
}

export interface ThreadActionInteractionPayload {
    text?: string,
    link?: string,
    form_data?: string,
    is_context_menu?: boolean,
    type: 'button' | 'image' | 'form' | 'select' | 'link',
}