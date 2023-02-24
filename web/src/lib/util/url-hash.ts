export enum PathType {
    User,
    UserThread,
    UserThreadKeychain,
    UserThreadStream,
    Unknown,
}

export type Path = {
    type: PathType;
    userId: string;
} | {
    type: PathType.UserThread;
    userId: string;
    threadId: string;
    page: number | null;
} | {
    type: PathType.UserThreadKeychain;
    userId: string;
    threadId: string;
    page: number | null;
} | {
    type: PathType.UserThreadStream;
    userId: string;
    threadId: string;
    page: number | null;
};

export const urlHash = (path: string): Path | null => {
    const segments = path.slice(1).split('/');
    const type = getType(segments);

    const page = getPage(type, segments);

    switch (type) {
        case PathType.User:
            return {
                type,
                userId: segments[1],
            };
        case PathType.UserThread:
            return {
                type: PathType.UserThread,
                userId: segments[1],
                threadId: segments[3],
                page,
            };
        case PathType.UserThreadKeychain:
            return {
                type: PathType.UserThreadKeychain,
                userId: segments[1],
                threadId: segments[3],
                page,
            };
        case PathType.UserThreadStream:
            return {
                type: PathType.UserThreadStream,
                userId: segments[1],
                threadId: segments[3],
                page,
            };
    }

    return null;
};

const isIntStr = (str: string): boolean =>
    String(
        parseInt(
            str,
            10,
        ),
    ) === str;

const getPage = (
    type: PathType,
    segments: string[],
): number | null => {
    switch (type) {
        case PathType.UserThread:
            if (segments.length === 5) {
                return parseInt(segments[4], 10);
            }
        case PathType.UserThreadKeychain:
            if (segments.length === 6) {
                return parseInt(segments[5], 10);
            }
        case PathType.UserThreadStream:
            if (segments.length === 6) {
                return parseInt(segments[5], 10);
            }
    }

    return null;
};

const getType = (segments: string[]): PathType => {
    const seglen = segments.length;

    if (segments[0] === 'user') {
        if (seglen === 2) {
            return PathType.User;
        }

        if (
            segments[2] === 'thread'
            && (
                !segments[4]
                || isIntStr(segments[4])
            )
        ) {
            return PathType.UserThread;
        }

        if (
            segments[2] === 'thread'
            && segments[4] === 'keychain'
            && (
                !segments[5]
                || isIntStr(segments[5])
            )
        ) {
            return PathType.UserThreadKeychain;
        }

        if (
            segments[2] === 'thread'
            && segments[4] === 'stream'
            && (
                !segments[5]
                || isIntStr(segments[5])
            )
        ) {
            return PathType.UserThreadStream;
        }
    }

    return PathType.Unknown;
};

// path to hash serializer
export const serializeUrlHash = (path: Path): string => {
    switch (path.type) {
        case PathType.User:
            return `user/${ path.userId }`;
        case PathType.UserThread:
            return `user/${ path.userId }/thread/${ path.threadId }${ path.page ? `/${ path.page }` : '' }`;
        case PathType.UserThreadKeychain:
            return `user/${ path.userId }/thread/${ path.threadId }/keychain${ path.page ? `/${ path.page }` : '' }`;
        case PathType.UserThreadStream:
            return `user/${ path.userId }/thread/${ path.threadId }/stream${ path.page ? `/${ path.page }` : '' }`;
        case PathType.Unknown:
            return '';
    }
};