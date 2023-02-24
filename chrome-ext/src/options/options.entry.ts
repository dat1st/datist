const user_id = document.querySelector('input[name="user_id"]')!;
const thread_id = document.querySelector('input[name="thread_id"]')!;

chrome.storage.sync.get('user_id', (result) => {
    const value = result.user_id;

    user_id.value = value || '';
});

chrome.storage.sync.get('thread_id', (result) => {
    const value = result.thread_id;

    thread_id.value = value || '';
});

// update storage when UI changes
([ [ user_id, 'user_id' ], [ thread_id, 'thread_id' ] ] as [ HTMLInputElement, string ][])
    .forEach(([input, name]) => {
        input.addEventListener('change', () => {
            console.log('change', input.value, name);
            chrome.storage.sync.set({
                [name]: input.value,
            });
        });
    });

// update UI when storage changes
chrome.storage.onChanged.addListener((
    changes,
    areaName,
) => {
    if (areaName === 'sync' && changes.user_id) {
        user_id.value = changes.user_id.newValue;
    }

    if (areaName === 'sync' && changes.thread_id) {
        thread_id.value = changes.thread_id.newValue;
    }
});
