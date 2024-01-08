export const getSyncStorage = () => {
    return chrome.storage.sync;
}

export const getNonSyncStorage = () => {
    return chrome.storage.local;
}

const BrowserStorage = (storage = getNonSyncStorage()) => {
    const _storage = storage;

    const getAllKeys = () => {
        return new Promise(resolve => {
            _storage.get(null, allItems => {
                resolve(Object.keys(allItems));
            });
        });
    }

    const getValue = (name:string) => {
        return new Promise(resolve => {
            _storage.get(name, items => {
                resolve(items[name]);
            });
        });
    }

    const removeKey = (name:string) => {
        return new Promise<void>(resolve => {
            _storage.remove(name, () => resolve());
        });
    }

    const setValue = (name:string, value:any) =>  {
        return new Promise<void>(resolve => {
            _storage.set({ [name]: value }, () => resolve());
        });
    }

    return {
        getAllKeys,
        getValue,
        removeKey,
        setValue
    }
}

export const browserStorageService = BrowserStorage()