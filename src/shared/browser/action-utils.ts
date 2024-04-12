import browser from "webextension-polyfill";
import { getImageFromUrl } from "../utils";

export const setActionIcon = async (iconUrl: string) => {
  try {
    const imageData = await getImageFromUrl(iconUrl);
    chrome.action.setIcon({ imageData });
  } catch (error) {}
};
