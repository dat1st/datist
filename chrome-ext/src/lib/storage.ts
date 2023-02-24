export const dumpStorage = (storage: Storage) => {
    const result = {};

    for (const [ key, val ] of Object.entries(storage)) {
        // @ts-ignore
        result[key] = val;
    }

    return result;
};

export const dumpLocalStorage = (w: { localStorage: Storage }) => dumpStorage(w.localStorage);
export const dumpSessionStorage = (w: { sessionStorage: Storage }) => dumpStorage(w.sessionStorage);

export const dumpAllStorage = (w: { localStorage: Storage, sessionStorage: Storage }) => ({
    localStorage: dumpLocalStorage(w),
    sessionStorage: dumpSessionStorage(w),
});