import { createContext, h } from 'preact';
import { useCallback, useContext, useEffect, useState } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import { urlHash, Path, serializeUrlHash } from '../../util/url-hash';

export type HashContextType =
    [
        string,
        (newHash: string) => void
    ];

export const HashContext =
    createContext<HashContextType>(
        [
            window.location.hash,
            () => void 0,
        ],
    );

export const useHash = () =>
    useContext(HashContext);

export const useParsedHash = (): [ Path | null, (newPath: Path) => void ] => {
    const [ hash, setHash ] = useContext(HashContext);

    return [
        urlHash(hash),
        (path: Path) => setHash(serializeUrlHash(path)),
    ];
};

export const setLocationHash = (hash: string) => {
    const url = new URL(window.location.href);

    url.hash = hash;

    window.history.pushState({}, '', url);
};

const useHashState = () => {
    const [ hash, setHash ] =
        useState(
            window.location.hash,
        );

    const hashChangeHandler =
        useCallback(() => {
            setHash(window.location.hash);
        }, []);

    useEffect(() => {
        window.addEventListener(
            'hashchange',
            hashChangeHandler,
        );

        return () => {
            window.removeEventListener(
                'hashchange',
                hashChangeHandler,
            );
        };
    }, []);

    const updateHash = useCallback(
        (newHash: string) => {
            if (newHash !== hash) {
                window.location.hash = newHash;
            }
        },
        [ hash ],
    );

    return [ hash, updateHash ];
};

export const HashProvider: FC<PropsWithChildren<unknown>> =
    ({ children }) => {
        const [ hash, updateHash ] =
            useHashState();

        return <HashContext.Provider value={ [ hash, updateHash ] as HashContextType }>
            { children }
        </HashContext.Provider>;
    };

export const withHashProvider =
    <T extends h.JSX.IntrinsicAttributes>(
        Component: FC<PropsWithChildren<T>>,
    ) =>
        (props: T) =>
            <HashProvider>
                <Component { ...props } />
            </HashProvider>;