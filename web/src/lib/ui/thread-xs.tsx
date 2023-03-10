import { useParsedHash } from './util/hashprovider';
import { h } from 'preact';
import { thread_xhrstream_get_entries } from '../util/datist';
import { useEffect, useState } from 'preact/hooks';
import { PathType } from '../util/url-hash';
import { ThreadXhrStreamEntry } from '../types';
import { dumpKeychainEntry } from '../util/user-helpers';
import { NavButtons } from './util/header-nav';

const parseEntry = (item: any) => {
    try {
        const out = JSON.parse(atob(item));

        if (out.formData) {
            return out.formData;
        } else {
            return out;
        }
    } catch (e) {
        try {
            return atob(item);
        } catch(e) {
            return item;
        }
    }
};

const processEntry = (entry: ThreadXhrStreamEntry) => {
    if (entry.data.formData) {
        return parseEntry(entry.data.formData);
    }

    if (entry.data.raw) {
        return entry.data.raw.map(parseEntry);
    }

    return null;
}

export const ThreadXhrStreamItem = (item: ThreadXhrStreamEntry) => {
    const [ hash, _ ] = useParsedHash();

    const [ payloadExpanded, setPayloadExpanded ] = useState(false);

    const rtype = item.data.raw ? 'raw' : 'formData';
    const pitem = processEntry(item);

    const size = JSON.stringify(pitem).length;

    const date = new Date(item.created_utc! / 1000);

    return (
        <li key={ date } className="list-item">
            <div class="list-item-header" onClick={ () => console.log(`Toggle row ${ item.id }`) }>
                <div class="list-item-header-label overflow-dots">
                    <a href={ item.url } alt={ item.url } target="_blank">{ item.url }</a>
                    <br/>{rtype} - {size}
                </div>
                <div class="list-item-header-right-wrap">
                    <div class="list-item-info-label">
                        { date.toISOString() }
                    </div>
                </div>
            </div>
            <div class="list-item-body">
                <ul class="list">
                    <li className="list-item">
                        <div className="list-item-header">
                            <div className="list-item-header-label"
                                 onClick={ () => setPayloadExpanded(!payloadExpanded) }>
                                Payload ⬇
                            </div>
                        </div>
                        <div className="list-item-body"
                             style={ !payloadExpanded ? { display: 'none' } : {} }
                        >
                            <pre>
                                { JSON.stringify(pitem, null, 4) }
                            </pre>
                        </div>
                    </li>
                </ul>
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

                        entries.map(item => <ThreadXhrStreamItem { ...item } />)
                    }
                </ul>
            </div>
        </div>
    );
};
