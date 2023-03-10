import { useParsedHash } from './hashprovider';
import { PathType } from '../../util/url-hash';
import { h } from 'preact';
import { dumpCookieStore } from '../../util/user-helpers';

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

    return <div class="user-box-inner">
        <input type="button" value="entries" onClick={ goToEntries } />
        <input type="button" value="stream" onClick={ goToStream } />
        <input type="button" value="origin stores" onClick={ goToKeychain } />
        <input type="button" value="cookie store" onClick={ getCookieStore } />
    </div>;
}