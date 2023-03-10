import 'preact/debug';
import { h, render } from 'preact';
import { MainUI } from './lib/ui/main';

(() => {
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = (...args: Parameters<typeof pushState>) => {
        pushState.apply(history, args);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
    };

    history.replaceState = (...args: Parameters<typeof replaceState>) => {
        replaceState.apply(history, args);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
    };

    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('locationchange'));
    });
})();

class Datist {
    constructor() {
        this.run();
    }

    run() {
        render(
            <MainUI />,
            document.getElementById('main')!,
        );
    }

    static _handleError(err: any) {
        window['console']['log'](err);
    }

    static init() {
        try {
            new Datist();
        } catch (err) {
            Datist._handleError(err);
        }
    }

    static ignite() {
        // `!document.readyState` ensures support for
        // IE 6 - 7 which lack support for readyState
        if (!document.readyState || document.readyState === 'loading') {
            let hasFired = false;

            const raceLock = () => {
                if (hasFired) {
                    return;
                }

                hasFired = true;

                Datist.init();
            };

            // This racing lock ensures compatibility with
            // IE 6 - 8 which lack support for DOMContentLoaded
            window.addEventListener('DOMContentLoaded', raceLock);
            window.addEventListener('load', raceLock);

            return;
        }

        // At this point document.readyState is either
        // `interactive` or `complete`, we have full
        // access to the DOM.

        Datist.init();
    }
}

Datist.ignite();

window.addEventListener('message', (event) => {
    if (event.data.type === 'xlrd_datist_init_pong') {
        // @ts-ignore
        window.__xlrd_datist_init = true;
    }
});

window.postMessage({
    type: 'xlrd_datist_init_ping',
});