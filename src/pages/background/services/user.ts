import { browserStorageService } from "@pages/background/services/browser-storage"

const USER_ENUMS = {
    PASSCODE: "user-passcode"
}

const User = () => {
    const getPasscode = async () : Promise<string> => {
        return await browserStorageService.getValue(USER_ENUMS.PASSCODE);
    }

    const removePasscode = async () => {
        await browserStorageService.removeKey(USER_ENUMS.PASSCODE);
    }

    const setPasscode = async (passcode: string) =>  {
        await browserStorageService.setValue(USER_ENUMS.PASSCODE, passcode)
    }

    return {
        removePasscode,
        getPasscode,
        setPasscode
    }
}

export const userService = User()