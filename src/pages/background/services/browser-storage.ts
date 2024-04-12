import browser from "webextension-polyfill";

export const getSyncStorage = () => {
  return browser.storage.sync;
};

export const getNonSyncStorage = () => {
  return browser.storage.local;
};

const BrowserStorage = (storage = getNonSyncStorage()) => {
  const _storage = storage;

  const getAllKeys = async () => {
    const allItems = await _storage.get(null);
    return Object.keys(allItems);
  };

  const getValue = async (name: string) => {
    const items = await _storage.get(name);
    return items[name];
  };

  const getValues = async (names: string[]) => {
    const items = await _storage.get(names);
    return items;
  };

  const removeKey = async (name: string) => {
    return await _storage.remove(name);
  };

  const setValue = async (name: string, value: any) => {
    return await _storage.set({ [name]: value });
  };

  return {
    getAllKeys,
    getValue,
    getValues,
    removeKey,
    setValue,
  };
};

export const browserStorageService = BrowserStorage();
