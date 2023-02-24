import { thread_keychain_get_entry } from './datist';

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