import { browserStorageService } from "@pages/background/services/browser-storage";

const USER_ENUMS = {
  PASSCODE: "user-passcode",
  CONTROLLER_ID: "controller-id",
};

const User = () => {
  const getPasscode = async (): Promise<string> => {
    return (await browserStorageService.getValue(
      USER_ENUMS.PASSCODE
    )) as string;
  };

  const removePasscode = async () => {
    await browserStorageService.removeKey(USER_ENUMS.PASSCODE);
  };

  const setPasscode = async (passcode: string) => {
    await browserStorageService.setValue(USER_ENUMS.PASSCODE, passcode);
  };

  const getControllerId = async (): Promise<string> => {
    return (await browserStorageService.getValue(
      USER_ENUMS.CONTROLLER_ID
    )) as string;
  };

  const removeControllerId = async () => {
    await browserStorageService.removeKey(USER_ENUMS.CONTROLLER_ID);
  };

  const setControllerId = async (controllerId: string) => {
    await browserStorageService.setValue(
      USER_ENUMS.CONTROLLER_ID,
      controllerId
    );
  };

  return {
    removePasscode,
    getPasscode,
    setPasscode,
    getControllerId,
    setControllerId,
    removeControllerId,
  };
};

export const userService = User();
