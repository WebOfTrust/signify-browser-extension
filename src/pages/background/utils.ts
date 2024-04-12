import browser from "webextension-polyfill";
import { getExtId } from "@shared/runtime-utils";

export const senderIsPopup = (sender: browser.Runtime.MessageSender) => {
  return (
    (sender.url?.startsWith("moz-extension://") ||
      sender.url?.startsWith("chrome-extension://")) &&
    sender.url?.endsWith("/src/pages/popup/index.html") &&
    sender.id === getExtId()
  );
};

export const getCurrentTab = (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
};

export const getCurrentUrl = async () => {
  const currentTab = await getCurrentTab();
  console.log("Current tab: ", currentTab);
  return currentTab ? new URL(currentTab.url!) : null;
};
