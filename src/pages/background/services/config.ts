import { browserStorageService } from "@pages/background/services/browser-storage"

const CONFIG_ENUMS = {
    VENDOR_URL: "vendor-url",
    VENDOR_DATA: "vendor-data",
    VENDOR_LANG: "vendor-lang",
}

const Config = () => {
    const getUrl = async (): Promise<string> => {
        return await browserStorageService.getValue(CONFIG_ENUMS.VENDOR_URL) as string;
    }

    const removeUrl = async () => {
        await browserStorageService.removeKey(CONFIG_ENUMS.VENDOR_URL);
    }

    const setUrl = async (token: string) =>  {
        await browserStorageService.setValue(CONFIG_ENUMS.VENDOR_URL, token)
    }

    const getData = async (): Promise<any> => {
        return await browserStorageService.getValue(CONFIG_ENUMS.VENDOR_DATA) as any;
    }

    const removeData = async () => {
        await browserStorageService.removeKey(CONFIG_ENUMS.VENDOR_DATA);
    }

    const setData = async (data: any) =>  {
        await browserStorageService.setValue(CONFIG_ENUMS.VENDOR_DATA, data)
    }

    const getLanguage = async (): Promise<string> => {
        return await browserStorageService.getValue(CONFIG_ENUMS.VENDOR_LANG) as string;
    }

    const setLanguage = async (lang: string) =>  {
        await browserStorageService.setValue(CONFIG_ENUMS.VENDOR_LANG, lang)
    }

    return {
        setUrl,
        removeUrl,
        getUrl,
        getData,
        removeData,
        setData,
        getLanguage,
        setLanguage
    }
}

export const configService = Config()