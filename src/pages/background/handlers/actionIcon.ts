import { IHandler } from "@config/types";

export function handleSetActionIcon({ sendResponse }: IHandler) {
  chrome.action.setBadgeBackgroundColor({ color: "#008000" }, () => {
    chrome.action.setBadgeText({ text: "1" });
    sendResponse({ data: { success: true } });
  });
}

export function handleUnsetActionIcon({ sendResponse }: IHandler) {
  chrome.action.setBadgeText({ text: "" });
  sendResponse({ data: { success: true } });
}

export function handleSetTabActionIcon({ sendResponse, tabId }: IHandler) {
  chrome.action.setBadgeBackgroundColor({ color: "#008000" }, () => {
    chrome.action.setBadgeText({ tabId: tabId, text: "1" });
    sendResponse({ data: { success: true } });
  });
}

export function handleUnsetTabActionIcon({ sendResponse, tabId }: IHandler) {
  chrome.action.setBadgeText({ tabId: tabId, text: "" });
  sendResponse({ data: { success: true } });
}
