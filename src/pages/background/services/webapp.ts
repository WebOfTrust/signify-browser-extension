import { browserStorageService } from "@pages/background/services/browser-storage";

const Webapp = () => {
  const getAppData = async (domain: string) => {
    return await browserStorageService.getValue(domain);
  };

  const setAppData = async (domain: string, newData = {}) => {
    let appData = (await getAppData(domain)) ?? {};
    appData = { ...appData, ...newData };
    return await browserStorageService.setValue(domain, appData);
  };

  return {
    getAppData,
    setAppData,
  };
};

export const webappService = Webapp();
