import { browserStorageService } from "@pages/background/services/browser-storage"

const CONFIG_ENUMS = {
    KERIA_URL: "keria-url"
}

const Config = () => {
    const getUrl = async (): Promise<string> => {
        return await browserStorageService.getValue(CONFIG_ENUMS.KERIA_URL) as string;
    }

    const removeUrl = async () => {
        await browserStorageService.removeKey(CONFIG_ENUMS.KERIA_URL);
    }

    const setUrl = async (token: string) =>  {
        await browserStorageService.setValue(CONFIG_ENUMS.KERIA_URL, token)
    }

    return {
        setUrl,
        removeUrl,
        getUrl
    }
}

export const configService = Config()