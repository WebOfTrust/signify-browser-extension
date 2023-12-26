import { browserStorageService } from "@pages/background/services/browser-storage"

const USER_ENUMS = {
    TOKEN: "user-token"
}

const User = () => {
    const getToken = async () => {
        return await browserStorageService.getValue(USER_ENUMS.TOKEN);
    }

    const removeToken = async () => {
        await browserStorageService.removeKey(USER_ENUMS.TOKEN);
    }

    const setToken = async (token: string) =>  {
        await browserStorageService.setValue(USER_ENUMS.TOKEN, token)
    }

    return {
        removeToken,
        getToken,
        setToken
    }
}

export const userService = User()