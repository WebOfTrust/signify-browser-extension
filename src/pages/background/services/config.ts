import { browserStorageService } from "@pages/background/services/browser-storage"

const CONFIG_ENUMS = {
    VENDOR_URL: "vendor-url"
}

const Config = () => {
    const getUrl = async (): Promise<string> => {
        return await browserStorageService.getValue(CONFIG_ENUMS.VENDOR_URL);
    }

    const removeUrl = async () => {
        await browserStorageService.removeKey(CONFIG_ENUMS.VENDOR_URL);
    }

    const setUrl = async (token: string) =>  {
        await browserStorageService.setValue(CONFIG_ENUMS.VENDOR_URL, token)
    }

    return {
        setUrl,
        removeUrl,
        getUrl
    }
}

export const configService = Config()