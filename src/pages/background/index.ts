import { configService } from "@pages/background/services/config";
import { userService } from "@pages/background/services/user";
import { signifyService } from "@pages/background/services/signify";
import { IMessage } from "@pages/background/types";
import { senderIsPopup } from "@pages/background/utils";

console.log("Background script loaded");

// import { connectClient, listCredentials, listIdentifiers } from "./signify";
//TODO: use the function calls above to connect to signify and list credentials and identifiers

// Handle messages
chrome.runtime.onMessage.addListener(function (
  message: IMessage<any>,
  sender,
  sendResponse
) {
  (async () => {
    if (sender.tab) {
      // Handle mesages from content script
      console.log(
        "Message received from content script at " +
          sender.tab.url +
          ": " +
          message.type
      );
      if (message.type) {
        switch (message.type) {
          case "getVersion":
            const manifestData = chrome.runtime.getManifest();
            sendResponse(manifestData.version);
            break;
          case "isUnlocked":
            const [tab] = await chrome.tabs.query({
              active: true,
              lastFocusedWindow: true,
            });
            const response = chrome.tabs.sendMessage(tab.id!, {
              type: "for_content_script",
            });
            // sendResponse(true);
            break;
          case "hasLogin":
            sendResponse({ login: "AID 123" });
            break;
          case "authenticate":
            sendResponse({ signature: "ABCD" });
            break;
          default:
            break;
        }
      }
    } else if (senderIsPopup(sender)) {
      // handle messages from Popup
      console.log("Message received from browser extension popup: " + message.type + ":" + message.subtype);
      
      if (
        message.type === "authentication" &&
        message.subtype === "check-agent-connection"
      ) {
        const isConnected = await signifyService.isConnected();
        sendResponse({ data: { isConnected } });
      }

      if (
        message.type === "authentication" &&
        message.subtype === "disconnect-agent"
      ) {
        await signifyService.disconnect();
        await userService.removePasscode();
        sendResponse({ data: { isConnected: false } });
      }

      if (
        message.type === "authentication" &&
        message.subtype === "connect-agent"
      ) {
        await signifyService.connect(
          message.data.vendorUrl,
          message.data.passcode
        );
        await configService.setUrl(message.data.vendorUrl);
        await userService.setPasscode(message.data.passcode);
        const state = await signifyService.isConnected();
        sendResponse({ data: { state } });
      }

      if (
        message.type === "fetch-resource" &&
        message.subtype === "identifiers"
      ) {
        const identifiers = await signifyService.listIdentifiers();
        sendResponse({ data: { aids: identifiers?.aids ?? [] } });
      }

      if (
        message.type === "fetch-resource" &&
        message.subtype === "credentials"
      ) {
        const credentials = await signifyService.listCredentials();
        sendResponse({ data: { credentials: credentials ?? [] } });
      }
    }
  })();

  // return true to indicate chrome api to send a response asynchronously
  return true;
});
