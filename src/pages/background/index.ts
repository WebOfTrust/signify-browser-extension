import browser from "webextension-polyfill";
import { configService } from "@pages/background/services/config";
import { IMessage } from "@config/types";
import { senderIsPopup } from "@pages/background/utils";
import { setActionIcon } from "@shared/browser/action-utils";
import { initCSHandler, initUIHandler } from "@pages/background/handlers";
import {
  handleFetchAutoSigninSignature,
  handleFetchSignifyHeaders,
} from "@pages/background/handlers/resource";
import { onBeforeSendHeadersHandler } from "@pages/background/handlers/browser-event";

console.log("Background script loaded");

const csHandler = initCSHandler();
const uiHandler = initUIHandler();

browser.runtime.onStartup.addListener(function () {
  (async () => {
    const vendorData = await configService.getVendorData();
    if (vendorData?.icon) {
      setActionIcon(vendorData?.icon);
    }
  })();

  return true;
});

browser.runtime.onInstalled.addListener(function (object) {
  if (object.reason === "install") {
    console.log("Signify Browser Extension installed");
  }
});

if (browser.webRequest) {
  browser.webRequest.onBeforeSendHeaders.addListener(
    // @ts-ignore
    onBeforeSendHeadersHandler,
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]
  );
}

// Listener to handle internal messages from content scripts from active tab and popup
browser.runtime.onMessage.addListener(function (
  message: IMessage<any>,
  sender,
  sendResponse
) {
  (async () => {
    // Handle mesages from content script on active tab
    if (sender.tab && sender.tab.active) {
      console.log("Message received from content script at ", sender?.tab?.url);
      console.log("Message Type", message.type);

      const processor = csHandler.get(message.type);
      if (processor) {
        processor({
          sendResponse,
          tabId: sender?.tab?.id,
          url: sender?.url,
          data: message?.data,
        });
      }

      // Handle messages from Popup
    } else if (senderIsPopup(sender)) {
      console.log("Message received from browser extension: ", message.type);

      const processor = uiHandler.get(message.type);
      if (processor) {
        processor({
          sendResponse,
          tabId: sender?.tab?.id,
          url: sender?.url,
          data: message?.data,
        });
      }
    }
  })();

  // return true to indicate chrome api to send a response asynchronously
  return true;
});

// Listener to handle external messages from allowed web pages with auto signin
browser.runtime.onMessageExternal.addListener(function (
  message,
  sender,
  sendResponse
) {
  (async () => {
    console.log("Message received from external source: ", sender);
    console.log("Message received from external request: ", message);

    // TODO: replace with External Handler like we did for uiHandler and csHandler
    if (
      message.type === "fetch-resource" &&
      message.subtype === "auto-signin-signature"
    ) {
      handleFetchAutoSigninSignature({ sendResponse, url: sender.url, data: message.data,});
    }

    if (
      message.type === "fetch-resource" &&
      message.subtype === "signify-headers"
    ) {
      handleFetchSignifyHeaders({
        sendResponse,
        url: sender.url,
        data: message.data,
      });
    }
  })();

  // return true to indicate chrome api to send a response asynchronously
  return true;
});
