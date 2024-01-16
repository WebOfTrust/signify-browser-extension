import { browserStorageService } from "@pages/background/services/browser-storage";
import { configService } from "@pages/background/services/config";
import { userService } from "@pages/background/services/user";
import { signifyService } from "@pages/background/services/signify";
import { IMessage } from "@pages/background/types";
import { senderIsPopup } from "@pages/background/utils";
import { getCurrentDomain } from "@pages/background/utils";
import { updateDomainAutoSigninByIndex, deleteSigninByIndex } from "@pages/background/signins-utils";

console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(function (object) {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("Signify Browser Extension installed");
  }
});

// Handle messages
chrome.runtime.onMessage.addListener(function (
  message: IMessage<any>,
  sender,
  sendResponse
) {
  (async () => {
    // Handle mesages from content script on active tab
    if (sender.tab && sender.tab.active) {
      console.log(
        "Message received from content script at " +
          sender.tab.url +
          " " +
          message.type +
          ":" +
          message.subtype
      );

      if (
        message.type === "authentication" &&
        message.subtype === "check-agent-connection"
      ) {
        const isConnected = await signifyService.isConnected();
        sendResponse({ data: { isConnected, tabUrl: sender?.tab.url } });
      }

      if (
        message.type === "authentication" &&
        message.subtype === "get-signed-headers"
      ) {
        const origin = sender.tab.url!;
        const signedHeaders = await signifyService.signHeaders(
          message.data.signin.identifier.name,
          origin
        );
        let jsonHeaders: { [key: string]: string } = {};
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
      console.log(
        "Message received from browser extension: " +
          message.type +
          "-" +
          message.subtype
      );

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
    }

    if (message.type === "create-resource" && message.subtype === "signin") {
      const signins = (await browserStorageService.getValue(
        "signins"
      )) as any[];
      const currentDomain = await getCurrentDomain();

      const { identifier, credential } = message.data;
      const signinObj = {
        identifier,
        credential,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        domain: currentDomain!.origin,
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

    if (message.type === "update-resource" && message.subtype === "auto-signin") {
      const resp = await updateDomainAutoSigninByIndex(message?.data?.index, message?.data?.signin);
      sendResponse({
        data: {
          ...resp,
        },
      });
    }

    if (message.type === "delete-resource" && message.subtype === "signins") {
      const resp = await deleteSigninByIndex(message?.data?.index);
      sendResponse({
        data: {
          ...resp,
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

chrome.runtime.onMessageExternal.addListener(async function (
  request,
  sender,
  sendResponse
) {
  console.log("Message received from external source: " + sender.url);
  // if (sender.url === blocklistedWebsite)
  //   return;  // don't allow this web page access
  // if (request.openUrlInEditor)
  //   openUrl(request.openUrlInEditor);
  // sendResponse({data: "received"})
  const origin = sender.url!;
  const signins = (await browserStorageService.getValue("signins")) as any;
  // Validate that message comes from a page that has a signin
  if (origin.startsWith(signins[0].domain)) {
    const signedHeaders = await signifyService.signHeaders(
      signins[0].identifier.name,
      origin
    );
    let jsonHeaders: { [key: string]: string } = {};
    for (const pair of signedHeaders.entries()) {
      jsonHeaders[pair[0]] = pair[1];
    }
    sendResponse({ data: { headers: jsonHeaders } });
  }
});
