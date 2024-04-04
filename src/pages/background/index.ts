import { configService } from "@pages/background/services/config";
import { signifyService } from "@pages/background/services/signify";
import * as signinResource from "@pages/background/resource/signin";
import { IMessage } from "@config/types";
import { senderIsPopup } from "@pages/background/utils";
import { removeSlash, setActionIcon } from "@pages/background/utils";
import { initCSHandler, initUIHandler } from "@pages/background/handlers";

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

    if (
      message.type === "fetch-resource" &&
      message.subtype === "auto-signin-signature"
    ) {
      // Validate that message comes from a page that has a signin
      const signins = await signinResource.getSigninsByDomain(sender.url);
      console.log("signins", signins);
      const autoSignin = signins?.find((signin) => signin.autoSignin);
      if (!signins?.length || !autoSignin) {
        sendResponse({
          error: { code: 404, message: "auto signin not found" },
        });
        return;
      }

      const signedHeaders = await signifyService.signHeaders(
        // sigin can either have identifier or credential
        autoSignin?.identifier
          ? autoSignin?.identifier?.name
          : autoSignin?.credential?.issueeName,
        removeSlash(sender.url)
      );
      let jsonHeaders: { [key: string]: string } = {};
      for (const pair of signedHeaders.entries()) {
        jsonHeaders[pair[0]] = pair[1];
      }
      sendResponse({ data: { headers: jsonHeaders } });
    }
  })();

  // return true to indicate chrome api to send a response asynchronously
  return true;
});
