import { userService } from "@pages/background/services/user";
import { configService } from "@pages/background/services/config";
import { senderIsPopup } from "@pages/background/utils";

console.log("Background script loaded");

export interface IMessage<T> {
    type: string
    subtype?: string
    data: T
}

// Handle messages
chrome.runtime.onMessage.addListener(function (message: IMessage<any>, sender, sendResponse) {
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
      console.log("Message received from browser extension pupup: " + message);
      if (
        message.type === "authentication" &&
        message.subtype === "persist-token"
      ) {
        await userService.setToken(message.data.passcode);
        await configService.setUrl(message.data.vendorUrl);
      }
      sendResponse({ resp: "received" });
    }
  })();

  // return true to indicate chrome api to send a response asynchronously
  return true;
});
