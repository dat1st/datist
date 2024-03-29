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
    created_utc: number;
}

export interface KeychainPayload {
    a: A;
    b: string[];
    c: string[];
}

export interface A {
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