import { h } from 'preact';
import { HashProvider, useParsedHash } from './util/hashprovider';
import { OnboardBox } from './onboard';
import { UserBox } from './user';
import { PathType } from '../util/url-hash';
import { ThreadBox } from './thread';
import { ThreadKeychainBox } from './thread-kc';
import { ThreadStreamBox } from './thread-xs';

export const MainUIInner = () => {
    const [ hash, _ ] = useParsedHash();

    if (hash?.type === PathType.User) {
        return <main>
            <UserBox />
        </main>;
    }

    if (hash?.type === PathType.UserThread) {
        return <main>
            <ThreadBox />
        </main>;
    }

    if (hash?.type === PathType.UserThreadKeychain) {
        return <main>
            <ThreadKeychainBox />
        </main>;
    }

    if (hash?.type === PathType.UserThreadStream) {
        return <main>
            <ThreadStreamBox />
        </main>;
    }

    return <main class="main center">
        <OnboardBox />
    </main>;
};

export const MainUI = () =>
    <HashProvider>
        <MainUIInner />
    </HashProvider>;