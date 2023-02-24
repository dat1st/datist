import { Directory } from 'wire';

export const src = new Directory('src', {
    log: true,
});
export const dist = new Directory('../assets/dist', {
    log: true,
    force: true,
});
