import browser from "webextension-polyfill";
import { getImageFromUrl } from "../utils";

export const setActionIcon = async (iconUrl: string) => {
  try {
    const imageData = await getImageFromUrl(iconUrl);
    chrome.action.setIcon({ imageData });
  } catch (error) {}
};

export const setBadge = async () => {
  await browser.action.setBadgeBackgroundColor({ color: "#008000" });
  await browser.action.setBadgeText({ text: "1" });
};

export const unsetBadge = async () => {
  await browser.action.setBadgeText({ text: "" });
};

export const setTabBadge = async ({ tabId }: { tabId: number }) => {
  await browser.action.setBadgeBackgroundColor({ color: "#008000" });
  await browser.action.setBadgeText({ tabId: tabId, text: "1" });
};

export const unsetTabBadge = async ({ tabId }: { tabId: number }) => {
  await browser.action.setBadgeText({ tabId: tabId, text: "" });
};
