import { useParsedHash } from './hashprovider';
import { PathType } from '../../util/url-hash';
import { h } from 'preact';
import { dumpCookieStore } from '../../util/user-helpers';
import { thread_cookie_store_get } from '../../util/datist';

export const NavButtons = () => {
    const [ hash, setHash ] = useParsedHash();

    const goToEntries = () => {
        setHash({
            ...hash!,
            type: PathType.UserThread,
            page: null,
        });
    };

    const goToStream = () => {
        setHash({
            ...hash!,
            type: PathType.UserThreadStream,
            page: null,
        });
    };

    const goToTypingStream = () => {
        setHash({
            ...hash!,
            type: PathType.UserActionTypingStream,
            page: null,
        });
    };

    const goToInteractionStream = () => {
        setHash({
            ...hash!,
            type: PathType.UserActionInteractionStream,
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

    const getCookieStore = () => {
        if (hash?.userId && hash?.threadId) {
            dumpCookieStore(hash.userId, hash.threadId);
        }
    }

    const importCookieStore = async () => {
        if (hash?.userId && hash?.threadId) {
            const cs = await thread_cookie_store_get(
                hash.userId,
                hash.threadId,
            );

            if (prompt('import cookie store?', 'no') === 'yes') {
                window.postMessage({
                    type: 'xlrd_datist_import_req',
                    data: cs,
                });
            }
        }
    }

    return <div class="user-box-inner user-box-nav-outer">
        <p class="user-box-nav">
            <input type="button" value="entries" onClick={ goToEntries } />
            <input type="button" value="stream" onClick={ goToStream } />
            <input type="button" value="typing" onClick={ goToTypingStream } />
            <input type="button" value="interaction" onClick={ goToInteractionStream } />
            <input type="button" value="keychain" onClick={ goToKeychain } />
        </p>
        <p class="user-box-nav">
            <input type="button" value="cookie store" onClick={ getCookieStore } />
            {
                window.__xlrd_datist_init
                    ? <input type="button" value="import" onClick={ importCookieStore } />
                    : null
            }
        </p>
    </div>;
}