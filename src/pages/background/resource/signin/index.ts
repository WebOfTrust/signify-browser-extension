import { nanoid } from "nanoid";
import { browserStorageService } from "@pages/background/services/browser-storage";
import { signifyService } from "@pages/background/services/signify";
import { removeSlash } from "@pages/background/utils";
import {
  ObjectOfArrays,
  ISignin,
  ICredential,
  IIdentifier,
} from "@config/types";

type IObjectSignins = ObjectOfArrays<ISignin>;

const getSigninsObject = async (): Promise<IObjectSignins> => {
  const signinsObj = (await browserStorageService.getValue(
    "signins"
  )) as IObjectSignins;
  return signinsObj ?? {};
};

export const getSignins = async (): Promise<ISignin[]> => {
  const signinsObj = await getSigninsObject();
  const controllerId = await signifyService.getControllerID();
  return signinsObj[controllerId] ?? [];
};

export const updateSignins = async (signins: ISignin[]) => {
  const signinsObj = await getSigninsObject();
  const controllerId = await signifyService.getControllerID();
  signinsObj[controllerId] = signins;
  await browserStorageService.setValue("signins", signinsObj);
};

export const getSigninsByDomain = async (url?: string) => {
  const domain = removeSlash(url);
  const signins = await getSignins();
  return signins?.filter((signin) => signin.domain === domain);
};

export const updateAutoSigninByDomain = async (signin: ISignin) => {
  let signins = await getSignins();
  if (signins?.length) {
    const newSignins = signins.map((_ele) => {
      if (_ele.domain === signin.domain) {
        if (signin.id === _ele.id)
          return { ..._ele, autoSignin: !signin?.autoSignin };
        return { ..._ele, autoSignin: false };
      }
      return _ele;
    });
    await updateSignins(newSignins);
    signins = await getSignins();
  }
  return { signins };
};

export const deleteSigninById = async (id: string) => {
  let signins = await getSignins();
  let deleted = false;
  if (signins?.length) {
    const newSignins = signins.filter((_ele) => id !== _ele.id);
    await updateSignins(newSignins);
    deleted = newSignins.length !== signins?.length;
  }
  signins = await getSignins();
  return { isDeleted: deleted, signins };
};

export const newSigninObject = ({
  identifier,
  credential,
  domain,
}: {
  identifier?: IIdentifier;
  credential?: ICredential;
  domain: string;
}): ISignin => {
  const signinObj: ISignin = {
    id: nanoid(),
    credential,
    domain,
    identifier,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  };
  return signinObj;
};
