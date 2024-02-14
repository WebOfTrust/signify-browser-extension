import { browserStorageService } from "@pages/background/services/browser-storage";

const CONFIG_ENUMS = {
  VENDOR_URL: "vendor-url",
  VENDOR_DATA: "vendor-data",
  VENDOR_LANG: "vendor-lang",
  AGENT_URL: "agent-url",
};

const Config = () => {
  const getUrl = async (): Promise<string> => {
    return (await browserStorageService.getValue(
      CONFIG_ENUMS.VENDOR_URL
    )) as string;
  };

  const removeUrl = async () => {
    await browserStorageService.removeKey(CONFIG_ENUMS.VENDOR_URL);
  };

  const setUrl = async (token: string) => {
    await browserStorageService.setValue(CONFIG_ENUMS.VENDOR_URL, token);
  };

  const getData = async (): Promise<any> => {
    return (await browserStorageService.getValue(
      CONFIG_ENUMS.VENDOR_DATA
    )) as any;
  };

  const removeData = async () => {
    await browserStorageService.removeKey(CONFIG_ENUMS.VENDOR_DATA);
  };

  const setData = async (data: any) => {
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

  const setAgentUrl = async (token: string) => {
    await browserStorageService.setValue(CONFIG_ENUMS.AGENT_URL, token);
  };

  const getAgentAndVendorInfo = async (): Promise<any> => {
    const resp = await browserStorageService.getValues([
      CONFIG_ENUMS.AGENT_URL,
      CONFIG_ENUMS.VENDOR_URL,
      CONFIG_ENUMS.VENDOR_DATA
    ]);
    return {
      vendorUrl: resp[CONFIG_ENUMS.VENDOR_URL],
      agentUrl: resp[CONFIG_ENUMS.AGENT_URL],
      vendorData: resp[CONFIG_ENUMS.VENDOR_DATA]
    };
  };

  return {
    setUrl,
    removeUrl,
    getUrl,
    getData,
    removeData,
    setData,
    getLanguage,
    setLanguage,
    getAgentUrl,
    setAgentUrl,
    getAgentAndVendorInfo
  };
};

export const configService = Config();
