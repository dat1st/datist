import { useParsedHash } from './util/hashprovider';
import { h } from 'preact';
import { thread_action_interaction_list_entries } from '../util/datist';
import { useEffect, useState } from 'preact/hooks';
import { ThreadActionInteractionEntry, ThreadActionTypingEntry, ThreadXhrStreamEntry } from '../types';
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
        } catch (e) {
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
};

export const ThreadInteractionStreamItem = (item: ThreadActionInteractionEntry) => {
    const date = new Date(item.created_utc! / 1000);

    return (
        <li key={ date } className="list-item">
            <div class="list-item-header" onClick={ () => console.log(`Toggle row ${ item.id }`) }>
                <div class="list-item-header-label overflow-dots">
                    <a href={ item.url } alt={ item.url } target="_blank">{ item.url }</a>
                    <br />type: <b>{ item.data.type }</b>
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
                        <div className="list-item-body">
                            {
                                Object.entries(item.data)
                                      .filter(([ key, value ]) => key !== 'type' && value !== null)
                                      .map(([ key, value ]) => (
                                          <div key={ key }>
                                              <b>{ key }</b>: { value }
                                          </div>
                                      ))
                            }
                        </div>
                    </li>
                </ul>
            </div>
        </li>
    );
};

export const ThreadInteractionStreamBox = () => {
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

    const [ entries, setEntries ] = useState<ThreadActionTypingEntry[]>([]);

    useEffect(() => {
        const fetchEntries = async () => {
            const entries = await thread_action_interaction_list_entries(
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

                        entries.map(item => <ThreadInteractionStreamItem { ...item } />)
                    }
                </ul>
            </div>
        </div>
    );
};
