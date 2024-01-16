import { browserStorageService } from "@pages/background/services/browser-storage";

export const updateDomainAutoSigninByIndex = async (index: number, signin) => {
  let signins = await browserStorageService.getValue("signins");
  if (signins?.length) {
    const newSignins = signins.map((_ele, idx) => {
      if (idx !== index && _ele.domain !== signin.domain) return _ele;

      if (idx !== index && _ele.domain === signin.domain)
        return { ..._ele, autoSignin: false };

      return { ..._ele, autoSignin: !signin?.autoSignin };
    });
    await browserStorageService.setValue("signins", newSignins);
  }
  signins = await browserStorageService.getValue("signins");

  return { signins };
};

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
