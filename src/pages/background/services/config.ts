import { browserStorageService } from "@pages/background/services/browser-storage";
import { default as defaultVendor } from "@src/config/vendor.json";

const CONFIG_ENUMS = {
  VENDOR_URL: "vendor-url",
  VENDOR_DATA: "vendor-data",
  VENDOR_LANG: "vendor-lang",
  AGENT_URL: "agent-url",
  BOOT_URL: "boot-url",
  HAS_ONBOARDED: "has-onboarded",
  WEB_APP_PERMISSION: "WEB_APP_PERMISSION",
};

export const WEB_APP_PERMS = {
  SET_VENDOR_URL: `${CONFIG_ENUMS.WEB_APP_PERMISSION}_set_vendor-url`,
};

const Config = () => {
  const getVendorUrl = async (): Promise<string> => {
    return (await browserStorageService.getValue(
      CONFIG_ENUMS.VENDOR_URL
    )) as string;
  };

  const removeVendorUrl = async () => {
    await browserStorageService.removeKey(CONFIG_ENUMS.VENDOR_URL);
  };

  const setVendorUrl = async (token: string) => {
    await browserStorageService.setValue(CONFIG_ENUMS.VENDOR_URL, token);
  };

  const getVendorData = async (): Promise<any> => {
    const _vendor = await browserStorageService.getValue(
      CONFIG_ENUMS.VENDOR_DATA
    );

    return _vendor ?? defaultVendor;
  };

  const removeVendorData = async () => {
    await browserStorageService.removeKey(CONFIG_ENUMS.VENDOR_DATA);
  };

  const setVendorData = async (data: any) => {
    await browserStorageService.setValue(CONFIG_ENUMS.VENDOR_DATA, data);
  };

  const getLanguage = async (): Promise<string> => {
    return (await browserStorageService.getValue(
      CONFIG_ENUMS.VENDOR_LANG
    )) as string;
  };

  const setLanguage = async (lang: string) => {
    await browserStorageService.setValue(CONFIG_ENUMS.VENDOR_LANG, lang);
  };

  const getAgentUrl = async (): Promise<string> => {
    return (await browserStorageService.getValue(
      CONFIG_ENUMS.AGENT_URL
    )) as string;
  };

  const setBootUrl = async (token: string) => {
    await browserStorageService.setValue(CONFIG_ENUMS.BOOT_URL, token);
  };

  const getBootUrl = async (): Promise<string> => {
    return (await browserStorageService.getValue(
      CONFIG_ENUMS.BOOT_URL
    )) as string;
  };

  const setAgentUrl = async (token: string) => {
    await browserStorageService.setValue(CONFIG_ENUMS.AGENT_URL, token);
  };

  const getHasOnboarded = async () => {
    return (await browserStorageService.getValue(
      CONFIG_ENUMS.HAS_ONBOARDED
    )) as boolean;
  };

  const setHasOnboarded = async (value: boolean) => {
    await browserStorageService.setValue(CONFIG_ENUMS.HAS_ONBOARDED, value);
  };

  const getAgentAndVendorInfo = async (): Promise<any> => {
    const resp = (await browserStorageService.getValues([
      CONFIG_ENUMS.AGENT_URL,
      CONFIG_ENUMS.VENDOR_URL,
      CONFIG_ENUMS.VENDOR_DATA,
      CONFIG_ENUMS.HAS_ONBOARDED,
      CONFIG_ENUMS.BOOT_URL,
    ])) as any;
    return {
      vendorUrl: resp[CONFIG_ENUMS.VENDOR_URL],
      agentUrl: resp[CONFIG_ENUMS.AGENT_URL],
      vendorData: resp[CONFIG_ENUMS.VENDOR_DATA],
      hasOnboarded: resp[CONFIG_ENUMS.HAS_ONBOARDED],
      bootUrl: resp[CONFIG_ENUMS.BOOT_URL],
    };
  };

  const getWebRequestedPermissions = async (): Promise<any> => {
    const resp = (await browserStorageService.getValue(
      CONFIG_ENUMS.WEB_APP_PERMISSION
    )) as any;
    return resp ?? {};
  };

  const setWebRequestedPermission = async (
    permissionKey: string,
    value: any
  ): Promise<void> => {
    const resp = await getWebRequestedPermissions();
    if (resp[permissionKey] && value === "delete") {
      delete resp[permissionKey];
    } else {
      resp[permissionKey] = value;
    }
    await browserStorageService.setValue(CONFIG_ENUMS.WEB_APP_PERMISSION, resp);
  };

  return {
    setVendorUrl,
    removeVendorUrl,
    getVendorUrl,
    getVendorData,
    removeVendorData,
    setVendorData,
    getLanguage,
    setLanguage,
    getAgentUrl,
    setAgentUrl,
    setBootUrl,
    getBootUrl,
    getHasOnboarded,
    setHasOnboarded,
    getAgentAndVendorInfo,
    setWebRequestedPermission,
    getWebRequestedPermissions,
  };
};

export const configService = Config();
