import { useParsedHash } from './util/hashprovider';
import { h } from 'preact';
import { thread_keychain_get_entries, thread_keychain_has_entry } from '../util/datist';
import { useEffect, useState } from 'preact/hooks';
import { KeychainEntry } from '../types';
import { PathType } from '../util/url-hash';
import { dumpKeychainEntry } from '../util/user-helpers';
import { NavButtons } from './util/header-nav';

export const ThreadKeychainListEntry = (item: KeychainEntry) => {
    const [ hash, _ ] = useParsedHash();

    const date = new Date(item.created_utc / 1000);

    const [ hasKeychainEntry, setHasKeychainEntry ] = useState(false);

    useEffect(
        () => {
            const origin = new URL(item.url).origin;

            thread_keychain_has_entry(
                hash?.userId!,
                hash?.threadId!,
                origin,
            )
                .then(val => {
                    setHasKeychainEntry(true);
                });
        },
        [ item.keychain_id ],
    );

    return (
        <li key={ date } className="list-item">
            <div class="list-item-header" onClick={ () => console.log(`Toggle row ${ item.id }`) }>
                <div class="list-item-header-label overflow-dots">
                    <a href={ item.url } alt={ item.url } target="_blank">{ item.url }</a>
                </div>
                <div class="list-item-header-right-wrap">
                    <div class="list-item-info-label">
                        { date.toISOString() }
                    </div>
                    <div class="list-item-header-action-wrap">
                        {
                            hasKeychainEntry
                                ? <div
                                    class="list-item-info-label"
                                    onClick={ () => dumpKeychainEntry(
                                        hash?.userId!,
                                        hash?.threadId!,
                                        (new URL(item.url)).origin,
                                    ) }
                                >
                                    dump origin stores
                                </div>
                                : null
                        }
                    </div>
                </div>
            </div>
        </li>
    );
};

export const ThreadKeychainBox = () => {
    const [ hash, setHash ] = useParsedHash();

    const page = hash?.page ?? 0;

    const handleReload = () => {
        // reload the list
    };

    const handlePrevPage = () => {
        setHash({
            ...hash!,
            page: page - 1,
        });
    };

    const handleNextPage = () => {
        setHash({
            ...hash!,
            page: page + 1,
        });
    };

    const [ entries, setEntries ] = useState<KeychainEntry[]>([]);

    useEffect(() => {
        const fetchEntries = async () => {
            const entries = await thread_keychain_get_entries(
                hash?.userId!,
                hash?.threadId!,
                page,
            );

            setEntries(entries);
        };

        fetchEntries();
    }, [ hash?.page ]);

    return (
        <div class="user-box-outer">
            <div class="center">
                User: { hash?.userId }<br />
                Thread: { hash?.threadId }
            </div>
            <NavButtons />
            <div class="list-nav">
                <button onClick={ handleReload }>Reload</button>
                <div class="pagination-buttons">
                    <button onClick={ handlePrevPage } disabled={ page === 0 }>Left</button>
                    <button onClick={ handleNextPage } disabled={ entries.length < 50 }>Right</button>
                </div>
            </div>
            <div class="user-box-inner">
                <ul class="list">
                    {
                        //data.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map(item => (
                        //    <ThreadEntry { ...item } />
                        //))

                        entries.map(item => <ThreadKeychainListEntry { ...item } />)
                    }
                </ul>
            </div>
        </div>
    );
};
