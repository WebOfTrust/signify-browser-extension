import { configService } from "@pages/background/services/config";
import { IMessage } from "@config/types";
import { senderIsPopup } from "@pages/background/utils";
import { setActionIcon } from "@shared/utils";
import { initCSHandler, initUIHandler } from "@pages/background/handlers";
import { handleFetchAutoSigninSignature } from "@pages/background/handlers/resource";

console.log("Background script loaded");

const csHandler = initCSHandler();
const uiHandler = initUIHandler();

chrome.runtime.onStartup.addListener(function () {
  (async () => {
    const vendorData = await configService.getVendorData();
    if (vendorData?.icon) {
      setActionIcon(vendorData?.icon);
    }
  })();

  return true;
});

chrome.runtime.onInstalled.addListener(function (object) {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("Signify Browser Extension installed");
  }
});

// Listener to handle internal messages from content scripts from active tab and popup
chrome.runtime.onMessage.addListener(function (
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
chrome.runtime.onMessageExternal.addListener(function (
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
      handleFetchAutoSigninSignature({ sendResponse, url: sender.url });
    }
  })();

  // return true to indicate chrome api to send a response asynchronously
  return true;
});
