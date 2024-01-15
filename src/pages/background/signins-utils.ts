import { browserStorageService } from "@pages/background/services/browser-storage";

export const deleteSigninByIndex = async (index: number) => {
  let signins = await browserStorageService.getValue("signins");
  let deleted = false;
  if (signins?.length) {
    const newSignins = signins.filter((_ele, idx) => idx !== index);
    await browserStorageService.setValue("signins", newSignins);
    deleted = newSignins.length !== signins?.length;
  }
  signins = await browserStorageService.getValue("signins");

  return { isDeleted: deleted, signins };
};
