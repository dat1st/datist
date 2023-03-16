import { useParsedHash } from './util/hashprovider';
import { h } from 'preact';
import { thread_get_entries, thread_keychain_has_entry } from '../util/datist';
import { useEffect, useState } from 'preact/hooks';
import { ThreadEntry } from '../types';
import { dumpKeychainEntry } from '../util/user-helpers';
import { NavButtons } from './util/header-nav';

export const ThreadListEntry = (item: ThreadEntry) => {
    const origin = new URL(item.url).origin;

    const [ hash, _ ] = useParsedHash();

    const date = new Date(item.created_utc / 1000);

    const [ hasKeychainEntry, setHasKeychainEntry ] = useState(false);

    useEffect(
        () => {
            thread_keychain_has_entry(
                hash?.userId!,
                hash?.threadId!,
                origin,
            )
                .then(() => setHasKeychainEntry(true));
        },
        [ item.keychain_id ],
    );

    const cookies =
        item.data
            .c
            .map(a => JSON.parse(a))
            .map(a =>
                [
                    [ a['name'], a['value'] ].join('='),
                    Object.entries(a)
                          .filter(([ k ]) =>
                              k !== 'name' && k !== 'value',
                          )
                          .map(([ k, v ]) =>
                              `${ k }=${ v }`,
                          )
                          .join('; '),
                ].join('; '),
            );

    const headers = item.data.h.map(a => a.join(': ')).join('\n');

    const [ metaExpanded, setMetaExpanded ] = useState(false);
    const [ headersExpanded, setHeadersExpanded ] = useState(false);
    const [ cookiesExpanded, setCookiesExpanded ] = useState(false);

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
                                        origin,
                                    ) }
                                >
                                    dump origin stores
                                </div>
                                : null
                        }
                        <div
                            class="list-item-info-label"
                            onClick={ () => setMetaExpanded(!metaExpanded) }
                        >
                            {
                                metaExpanded ? '⬆' : '⬇'
                            }
                        </div>
                    </div>
                </div>
            </div>
            {
                metaExpanded
                    ? <div class="list-item-body">
                        <ul class="list">
                            <li className="list-item">
                                <div className="list-item-header">
                                    <div className="list-item-header-label"
                                         onClick={ () => setHeadersExpanded(!headersExpanded) }>
                                        Headers ⬇
                                    </div>
                                </div>
                                <div className="list-item-body"
                                     style={ !headersExpanded ? { display: 'none' } : {} }
                                >
                                    <pre>
                                        { headers }
                                    </pre>
                                </div>
                            </li>
                            <li className="list-item">
                                <div className="list-item-header">
                                    <div className="list-item-header-label"
                                         onClick={ () => setCookiesExpanded(!cookiesExpanded) }>
                                        Cookies ⬇
                                    </div>
                                </div>
                                <div className="list-item-body overflow-dots"
                                     style={ !cookiesExpanded ? { display: 'none' } : {} }
                                >
                                    <pre>
                                        { cookies.join('\n\n') }
                                    </pre>
                                </div>
                            </li>
                        </ul>
                    </div>
                    : null
            }
        </li>
    );
};

export const ThreadBox = () => {
    const [ hash, setHash ] = useParsedHash();
    const [ epoch, setEpoch ] = useState(0);

    const page = hash?.page ?? 0;

    const handleReload = () => {
        setEpoch(epoch + 1);
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

    const [ entries, setEntries ] = useState<ThreadEntry[]>([]);

    useEffect(() => {
        const fetchEntries = async () => {
            const entries = await thread_get_entries(
                hash?.userId!,
                hash?.threadId!,
                page,
            );

            setEntries(entries);
        };

        fetchEntries();
    }, [ hash?.page, epoch ]);

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

                        entries.map(item => <ThreadListEntry { ...item } />)
                    }
                </ul>
            </div>
        </div>
    );
};
