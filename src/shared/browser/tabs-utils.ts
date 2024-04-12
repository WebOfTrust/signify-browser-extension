import browser from "webextension-polyfill";

export const getCurrentTab = async (): Promise<browser.Tabs.Tab> => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

export const sendMessageTab = async (tabId: number,{
  type,
  subtype,
  eventType
}: {
  type: string;
  subtype: string;
  eventType?: string
}) => {
  return browser.tabs.sendMessage(tabId, {
    type,
    subtype,
    eventType
  });
};
