import { thread_cookie_store_get, thread_keychain_get_entry } from './datist';

export const dumpKeychainEntry = (
    userId: string,
    threadId: string,
    origin: string,
) => {
    thread_keychain_get_entry(
        userId,
        threadId,
        origin,
    )
        .then(entry => {
            const url = new URL(origin);

            const data = JSON.stringify(entry);

            const blob = new Blob([ data ], { type: 'application/json' });

            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${ url.hostname }.json`;
            a.click();

            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        });
}

export const dumpCookieStore = (
    userId: string,
    threadId: string,
) => {
    thread_cookie_store_get(
        userId,
        threadId,
    )
        .then(data => {
            const out = JSON.stringify(data);

            const blob = new Blob([ out ], { type: 'application/json' });

            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `cookies-${userId}-${threadId}.json`;
            a.click();

            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        });
}