import browser from "webextension-polyfill";

export const getCurrentTab = async (): Promise<browser.Tabs.Tab> => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

export const sendMessageTab = async (tabId: number,{
  type,
  subtype,
  eventType,
  data,
}: {
  type: string;
  subtype: string;
  eventType?: string;
  data?: any;
}) => {
  return browser.tabs.sendMessage(tabId, {
    type,
    subtype,
    eventType,
    data
  });
};
