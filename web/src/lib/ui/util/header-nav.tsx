import { useParsedHash } from './hashprovider';
import { PathType } from '../../util/url-hash';
import { h } from 'preact';

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

    return <div class="user-box-inner">
        <input type="button" value="entries" onClick={ goToEntries } />
        <input type="button" value="stream" onClick={ goToStream } />
        <input type="button" value="origin stores" onClick={ goToKeychain } />
    </div>;
}