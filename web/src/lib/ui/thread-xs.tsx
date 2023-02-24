import { useParsedHash } from './util/hashprovider';
import { h } from 'preact';
import { thread_xhrstream_get_entries } from '../util/datist';
import { useEffect, useState } from 'preact/hooks';
import { PathType } from '../util/url-hash';
import { ThreadXhrStreamEntry } from '../types';

export const ThreadXhrStreamItem = (item: ThreadXhrStreamEntry) => {
    const [ hash, _ ] = useParsedHash();

    const date = new Date(item.created_utc! / 1000);

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
                </div>
            </div>
        </li>
    );
};

export const ThreadStreamBox = () => {
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

    const [ entries, setEntries ] = useState<ThreadXhrStreamEntry[]>([]);

    useEffect(() => {
        const fetchEntries = async () => {
            const entries = await thread_xhrstream_get_entries(
                hash?.userId!,
                hash?.threadId!,
                page,
            );

            setEntries(entries);
        };

        fetchEntries();
    }, [ hash?.page ]);

    const goToEntries = () => {
        setHash({
            ...hash!,
            type: PathType.UserThread,
            page: null,
        });
    };

    const goToKeychain = () => {
        setHash({
            ...hash!,
            type: PathType.UserThreadKeychain,
            page: null,
        });
    };

    return (
        <div class="user-box-outer">
            <div class="center">
                User: { hash?.userId }<br />
                Thread: { hash?.threadId }
            </div>
            <div class="user-box-inner">
                <input type="button" value="entries" onClick={ goToEntries } />
                <input type="button" value="stream" disabled />
                <input type="button" value="origin stores" onClick={ goToKeychain } />
            </div>
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

                        entries.map(item => <ThreadXhrStreamItem { ...item } />)
                    }
                </ul>
            </div>
        </div>
    );
};
