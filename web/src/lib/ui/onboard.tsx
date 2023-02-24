import { h } from 'preact';
import { useParsedHash } from './util/hashprovider';
import { useEffect, useState } from 'preact/hooks';
import { user_create, user_find } from '../util/datist';
import { PathType } from '../util/url-hash';

export const InitBox = () => {
    const [ hash, setHash ] = useParsedHash();

    const new_user = async () => {
        try {
            let user = await user_create();

            setHash({
                ...hash!,
                type: PathType.User,
                userId: user.id!,
            });
        } catch {
        }
    };

    return <div class="init box">
        <input
            type="button"
            value="create new user"
            onClick={ new_user }
        />
    </div>;
};

export const LoginBox = () => {
    const [ hash, setHash ] = useParsedHash();
    const [ userId, setUserId ] = useState<string | null>(null);

    const login = async () => {
        try {
            await user_find(userId!);

            setHash({
                ...hash!,
                type: PathType.User,
                userId: userId!,
            });
        } catch {
        }
    };

    return <div className="box login">
        <div className="login-buttons">
            <input
                type="text"
                placeholder="user"
                value={ userId || undefined }
                onChange={ e => setUserId(e.target.value) }
            />
            <input
                type="button"
                value="✈"
                onClick={ login }
            />
        </div>
    </div>;
};

export const OnboardBox = () => {
    return <div class="onboard-box">
        <InitBox />
        <LoginBox />
    </div>;
};