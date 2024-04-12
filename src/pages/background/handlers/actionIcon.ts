import { IHandler } from "@config/types";
import {
  setBadge,
  unsetBadge,
  setTabBadge,
  unsetTabBadge,
} from "@shared/browser/action-utils";

export async function handleSetActionIcon({ sendResponse }: IHandler) {
  await setBadge();
  sendResponse({ data: { success: true } });
}

export async function handleUnsetActionIcon({ sendResponse }: IHandler) {
  await unsetBadge();
  sendResponse({ data: { success: true } });
}

export async function handleSetTabActionIcon({ sendResponse, tabId }: IHandler) {
  await setTabBadge({ tabId: tabId! });
  sendResponse({ data: { success: true } });
}

export async function handleUnsetTabActionIcon({ sendResponse, tabId }: IHandler) {
  await unsetTabBadge({ tabId: tabId! });
  sendResponse({ data: { success: true } });
}
