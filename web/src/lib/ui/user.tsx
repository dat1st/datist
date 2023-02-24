import { useParsedHash } from './util/hashprovider';
import { useEffect, useState } from 'preact/hooks';
import { thread_create, thread_find } from '../util/datist';
import { h } from 'preact';
import { PathType } from '../util/url-hash';

export const InitThreadBox = () => {
    const [ hash, setHash ] = useParsedHash();

    const new_thread = async () => {
        try {
            const userId = hash?.userId!;

            let thread = await thread_create(
                userId,
            );

            setHash({
                type: PathType.UserThread,
                userId: userId,
                threadId: thread.id!,
                page: null,
            });
        } catch {
        }
    };

    return <div class="init box">
        <input
            type="button"
            value="create new thread"
            onClick={ new_thread }
        />
    </div>;
};

export const OpenThreadBox = () => {
    const [ hash, setHash ] = useParsedHash();
    const [ threadId, setThreadId ] = useState<string | null>(null);

    useEffect(() => {
        console.log(-1, hash);
    }, []);

    const open_thread = async () => {
        console.log(threadId);

        try {
            const userId = hash?.userId!;

            await thread_find(
                userId,
                threadId!,
            );

            setHash({
                type: PathType.UserThread,
                userId: userId,
                threadId: threadId!,
                page: null,
            });
        } catch {
        }
    };

    return <div className="box login">
        <div className="login-buttons">
            <input
                type="text"
                placeholder="thread"
                value={ threadId || undefined }
                onChange={ e => setThreadId(e.target.value) }
            />
            <input type="button" value="✈" onClick={ open_thread } />
        </div>
    </div>;
};

export const UserBox = () => {
    const [ hash, _ ] = useParsedHash();

    console.log(hash);

    return <div class="user-box-outer">
        <div>User: { hash?.userId }</div>
        <div class="user-box-inner">
            <InitThreadBox />
            <OpenThreadBox />
        </div>
    </div>;
};