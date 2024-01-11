import { browserStorageService } from "@pages/background/services/browser-storage";
import { webappService } from "@pages/background/services/webapp";
import { configService } from "@pages/background/services/config";
import { userService } from "@pages/background/services/user";
import { signifyService } from "@pages/background/services/signify";
import { IMessage } from "@pages/background/types";
import { senderIsPopup } from "@pages/background/utils";
import { getCurrentDomain } from "@pages/background/utils";

console.log("Background script loaded");

// Handle messages
chrome.runtime.onMessage.addListener(function (
  message: IMessage<any>,
  sender,
  sendResponse
) {
  (async () => {

    // Handle mesages from content script on active tab
    if (sender.tab &&  sender.tab.active) {

      console.log(
        "Message received from content script at " +
          sender.tab.url + " " +
          message.type + ":" +
          message.subtype
      );

      if (
        message.type === "authentication" &&
        message.subtype === "check-agent-connection"
      ) {
        const isConnected = await signifyService.isConnected();
        sendResponse({ data: { isConnected, meta: { tab: sender?.tab } } });
      }

      if (
        message.type === "authentication" &&
        message.subtype === "get-signed-headers"
      ) {
        const origin = sender.tab.url!;
        const signedHeaders = await signifyService.signHeaders(message.data.signin.identifier.name, origin);
        let jsonHeaders: { [key: string]: string; } = {};
        for (const pair of signedHeaders.entries()) {
          jsonHeaders[pair[0]] = pair[1];
        }
        sendResponse({ data: { headers: jsonHeaders } });
      }

      if (
        message.type === "fetch-resource" &&
        message.subtype === "tab-signin"
      ) {
        const signins = await browserStorageService.getValue("signins");
        sendResponse({ data: { signins: signins ?? [] } });
      }
      
    // Handle messages from Popup
    } else if (senderIsPopup(sender)) {
      console.log("Message received from browser extension: " + message.type + "-" + message.subtype);

      if (
        message.type === "authentication" &&
        message.subtype === "check-agent-connection"
      ) {
        const isConnected = await signifyService.isConnected();
        sendResponse({ data: { isConnected, meta: { tab: sender?.tab } } });
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
    }

    if (message.type === "tab" && message.subtype === "get-tab-state") {
      const currentDomain = await getCurrentDomain();
      const appData = await webappService.getAppData(currentDomain?.origin);
      sendResponse({ data: appData });
    }

    if (message.type === "tab" && message.subtype === "set-app-state") {
      const currentDomain = await getCurrentDomain();
      await webappService.setAppData(currentDomain.origin, message.data);
      const appData = await webappService.getAppData(currentDomain.origin);
      sendResponse({ data: appData });
    }

    if (message.type === "create-resource" && message.subtype === "signin") {
      const signins = await browserStorageService.getValue("signins");
      const currentDomain = await getCurrentDomain();

      const { identifier, credential } = message.data;
      const signinObj = {
        identifier,
        credential,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        domain: currentDomain.origin,
      };
      if (signins && signins?.length) {
        await browserStorageService.setValue("signins", [
          ...signins,
          signinObj,
        ]);
      } else {
        await browserStorageService.setValue("signins", [signinObj]);
      }
      const storageSignins = await browserStorageService.getValue("signins");
      sendResponse({ data: { signins: storageSignins } });
    }
    if (
      message.type === "fetch-resource" &&
      message.subtype === "identifiers"
    ) {
      const identifiers = await signifyService.listIdentifiers();
      sendResponse({ data: { aids: identifiers?.aids ?? [] } });
    }

    if (message.type === "fetch-resource" && message.subtype === "signins") {
      const signins = await browserStorageService.getValue("signins");
      sendResponse({
        data: {
          signins: signins ?? [],
        },
      });
    }

    if (
      message.type === "fetch-resource" &&
      message.subtype === "credentials"
    ) {
      const credentials = await signifyService.listCredentials();
      sendResponse({ data: { credentials: credentials ?? [] } });
    }

  })();

  // return true to indicate chrome api to send a response asynchronously
  return true;
});
