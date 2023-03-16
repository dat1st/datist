import {
    CookieStore,
    KeychainEntry,
    KeychainPayload,
    Thread,
    ThreadActionTypingEntry,
    ThreadEntry,
    ThreadPayload,
    ThreadXhrStreamEntry,
    User,
} from '../types';

//const API_BASE_URL = 'https://dat.ist';
const API_BASE_URL = '';

// POST /user
export const user_create = (): Promise<User> =>
    fetch(`${ API_BASE_URL }/user`, {
        method: 'POST',
        body: '',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// GET /u/:user_id
export const user_find = (user_id: string): Promise<User> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }`)
        .then(response => response.json());

// POST /u/:user_id/t
export const thread_create = (user_id: string): Promise<Thread> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/t`, {
        method: 'POST',
        body: '',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// GET /u/:user_id/t/:thread_id
export const thread_find = (
    user_id: string,
    thread_id: string,
): Promise<Thread> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/t/${ thread_id }`)
        .then(response => response.json());

// GET /u/:user_id/t/:thread_id/:page
export const thread_get_entries = (
    user_id: string,
    thread_id: string,
    page: number,
): Promise<ThreadEntry[]> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/t/${ thread_id }/${ page }`)
        .then(response => response.json());

// POST /u/:user_id/t/:thread_id
export const thread_add_entry = (
    user_id: string,
    thread_id: string,
    data: ThreadPayload,
) =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/t/${ thread_id }`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// GET /u/:user_id/t/:thread_id/k/:page
export const thread_keychain_get_entries = (
    user_id: string,
    thread_id: string,
    page: number,
): Promise<KeychainEntry[]> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/t/${ thread_id }/k/${ page }`)
        .then(response => response.json());

// POST /u/:user_id/t/:thread_id/k/get
export const thread_keychain_get_entry = (
    user_id: string,
    thread_id: string,
    url: string,
): Promise<KeychainEntry> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/t/${ thread_id }/k/get`, {
        method: 'POST',
        body: JSON.stringify(url),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// POST /u/:user_id/t/:thread_id/k/has
export const thread_keychain_has_entry = (
    user_id: string,
    thread_id: string,
    url: string,
): Promise<KeychainEntry> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/t/${ thread_id }/k/has`, {
        method: 'POST',
        body: JSON.stringify(url),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// POST /u/:user_id/t/:thread_id/k
export const thread_keychain_add_entry = (
    user_id: string,
    thread_id: string,
    data: KeychainPayload,
) =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/t/${ thread_id }/k`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// POST /u/:user_id/t/:thread_id/k
export const thread_keychain_add_url_filter = (
    user_id: string,
    thread_id: string,
    urls: string[],
) =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/t/${ thread_id }/k/uf`, {
        method: 'POST',
        body: JSON.stringify(urls),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// POST /u/:user_id/t/:thread_id/c
export const thread_cookie_store_set = (
    user_id: string,
    thread_id: string,
    data: CookieStore,
) =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/tc/${ thread_id }`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// GET /u/:user_id/t/:thread_id/c/get
export const thread_cookie_store_get = (
    user_id: string,
    thread_id: string,
): Promise<CookieStore> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/tc/${ thread_id }/get`, {
        method: 'POST',
    })
        .then(response => response.json());

// POST /u/:user_id/tx/:thread_id/xs
export const thread_xhrstream_add_entry = (
    user_id: string,
    thread_id: string,
    data: ThreadXhrStreamEntry,
) =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/tx/${ thread_id }`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// GET /u/:user_id/tx/:thread_id/xs/:page
export const thread_xhrstream_get_entries = (
    user_id: string,
    thread_id: string,
    page: number,
): Promise<ThreadXhrStreamEntry[]> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/tx/${ thread_id }/${ page }`)
        .then(response => response.json());

// POST /u/:user_id/at/:thread_id/xs
export const thread_action_typing_add_entry = (
    user_id: string,
    thread_id: string,
    data: ThreadActionTypingEntry,
) =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/at/${ thread_id }`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json());

// GET /u/:user_id/at/:thread_id/xs/:page
export const thread_action_typing_list_entries = (
    user_id: string,
    thread_id: string,
    page: number,
): Promise<ThreadActionTypingEntry[]> =>
    fetch(`${ API_BASE_URL }/u/${ user_id }/at/${ thread_id }/${ page }`)
        .then(response => response.json());