import {
  WEB_APP_PERMS,
  configService,
} from "@pages/background/services/config";
import { userService } from "@pages/background/services/user";
import { signifyService } from "@pages/background/services/signify";
import * as signinResource from "@pages/background/resource/signin";
import { IMessage, IIdentifier, ICredential } from "@config/types";
import { senderIsPopup } from "@pages/background/utils";
import {
  removeSlash,
  getCurrentUrl,
  setActionIcon,
} from "@pages/background/utils";

console.log("Background script loaded");

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
      console.log(
        "Message received from content script at " +
          sender.tab.url +
          " " +
          message.type +
          ":" +
          message.subtype
      );

      if (
        message.type === "action-icon" &&
        message.subtype === "set-action-icon"
      ) {
        chrome.action.setBadgeBackgroundColor({ color: "#008000" }, () => {
          chrome.action.setBadgeText({ text: "1" });
          sendResponse({ data: { success: true } });
        });
      }

      if (
        message.type === "action-icon" &&
        message.subtype === "set-tab-action-icon"
      ) {
        chrome.action.setBadgeBackgroundColor({ color: "#008000" }, () => {
          chrome.action.setBadgeText({ tabId: sender.tab?.id, text: "1" });
          sendResponse({ data: { success: true } });
        });
      }

      if (
        message.type === "action-icon" &&
        message.subtype === "unset-tab-action-icon"
      ) {
        chrome.action.setBadgeText({ tabId: sender.tab?.id, text: "" });
        sendResponse({ data: { success: true } });
      }

      if (
        message.type === "action-icon" &&
        message.subtype === "unset-action-icon"
      ) {
        chrome.action.setBadgeText({ text: "" });
        sendResponse({ data: { success: true } });
      }

      if (
        message.type === "vendor-info" &&
        message.subtype === "get-vendor-data"
      ) {
        const vendorData = await configService.getVendorData();
        sendResponse({ data: { vendorData } });
      }

      if (
        message.type === "vendor-info" &&
        message.subtype === "attempt-set-vendor-url"
      ) {
        const { vendorUrl } = message?.data ?? {};
        await configService.setWebRequestedPermission(
          WEB_APP_PERMS.SET_VENDOR_URL,
          { origin: sender.tab.url, vendorUrl }
        );
        sendResponse({ data: { success: true } });
      }

      if (
        message.type === "fetch-resource" &&
        message.subtype === "auto-signin-signature"
      ) {
        // Validate that message comes from a page that has a signin
        const signins = await signinResource.getSigninsByDomain(sender.url!);
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
          origin
        );
        let jsonHeaders: { [key: string]: string } = {};
        for (const pair of signedHeaders.entries()) {
          jsonHeaders[pair[0]] = pair[1];
        }
        sendResponse({ data: { headers: jsonHeaders } });
      }

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
        console.log(message.data.signin);

        const signedHeaders = await signifyService.signHeaders(
          message.data.signin.identifier
            ? message.data.signin.identifier.name
            : message.data.signin.credential.issueeName,
          origin
        );
        let jsonHeaders: { [key: string]: string } = {};
        for (const pair of signedHeaders.entries()) {
          jsonHeaders[pair[0]] = pair[1];
        }
        sendResponse({
          data: {
            headers: jsonHeaders,
            credential: message.data.signin.credential
              ? message.data.signin.credential
              : null,
          },
        });
      }

      if (
        message.type === "fetch-resource" &&
        message.subtype === "tab-signin"
      ) {
        const signins = await signinResource.getSigninsByDomain(sender.url);
        const autoSigninObj = signins?.find((signin) => signin.autoSignin);
        sendResponse({ data: { signins: signins ?? [], autoSigninObj } });
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
        message.type === "action-icon" &&
        message.subtype === "unset-action-icon"
      ) {
        chrome.action.setBadgeText({ text: "" });
        sendResponse({ data: { success: true } });
      }

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
        sendResponse({ data: { isConnected: false } });
      }

      if (
        message.type === "authentication" &&
        message.subtype === "connect-agent"
      ) {
        const resp = (await signifyService.connect(
          message.data.agentUrl,
          message.data.passcode
        )) as any;
        if (resp?.error) {
          // TODO: improve error messages
          // Current messages are not descrptive enough e.g
          // bran must be 21 characters
          // agent does not exist for controller <controller-id>
          // using custom error message for now instead of resp?.error?.message

          sendResponse({
            error: {
              code: 404,
              message: resp?.error?.message,
            },
          });
        } else {
          await userService.setPasscode(message.data.passcode);
          sendResponse({ data: { success: true } });
        }
      }

      if (
        message.type === "authentication" &&
        message.subtype === "boot-and-connect-agent"
      ) {
        const resp = (await signifyService.bootAndConnect(
          message.data.agentUrl,
          message.data.bootUrl,
          message.data.passcode
        )) as any;
        if (resp?.error) {
          sendResponse({
            error: {
              code: 404,
              message: resp?.error?.message,
            },
          });
        } else {
          await userService.setPasscode(message.data.passcode);
          sendResponse({ data: { success: true } });
        }
      }

      if (
        message.type === "authentication" &&
        message.subtype === "generate-passcode"
      ) {
        const passcode = signifyService.generatePasscode();
        sendResponse({ data: { passcode } });
      }
    }

    if (message.type === "create-resource" && message.subtype === "signin") {
      const signins = await signinResource.getSignins();
      const currentUrl = await getCurrentUrl();
      const { identifier, credential } = message.data;
      let signinExists = false;
      if (identifier && identifier.prefix) {
        signinExists = Boolean(
          signins?.find(
            (signin) =>
              signin.domain === currentUrl?.origin &&
              signin?.identifier?.prefix === identifier.prefix
          )
        );
      }

      if (credential && credential.sad.d) {
        signinExists = Boolean(
          signins?.find(
            (signin) =>
              signin.domain === currentUrl?.origin &&
              signin?.credential?.sad?.d === credential.sad.d
          )
        );
      }

      if (signinExists) {
        sendResponse({ data: { signins: signins } });
      } else {
        const signinObj = signinResource.newSigninObject({
          identifier,
          credential,
          domain: currentUrl!.origin,
        });
        if (signins && signins?.length) {
          await signinResource.updateSignins([...signins, signinObj]);
        } else {
          await signinResource.updateSignins([signinObj]);
        }
        const storageSignins = await signinResource.getSignins();
        sendResponse({ data: { signins: storageSignins } });
      }
    }
    if (
      message.type === "create-resource" &&
      message.subtype === "identifier"
    ) {
      try {
        const resp = await signifyService.createAID(message.data.name);
        sendResponse({ data: { ...(resp ?? {}) } });
      } catch (error: any) {
        const errorMsg = JSON.parse(error?.message ?? "");
        sendResponse({
          error: { code: 404, message: errorMsg?.title },
        });
      }
    }
    if (
      message.type === "fetch-resource" &&
      message.subtype === "identifiers"
    ) {
      const identifiers = await signifyService.listIdentifiers();
      sendResponse({ data: { aids: identifiers ?? [] } });
    }

    if (message.type === "fetch-resource" && message.subtype === "signins") {
      const signins = await signinResource.getSignins();
      sendResponse({
        data: {
          signins,
        },
      });
    }

    if (
      message.type === "update-resource" &&
      message.subtype === "auto-signin"
    ) {
      const resp = await signinResource.updateAutoSigninByDomain(message?.data?.signin);
      sendResponse({
        data: {
          ...resp,
        },
      });
    }

    if (message.type === "delete-resource" && message.subtype === "signins") {
      const resp = await signinResource.deleteSigninById(message?.data?.id);
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
      var credentials = await signifyService.listCredentials();
      const indentifiers = await signifyService.listIdentifiers();
      console.log(indentifiers);
      // Add holder name to credential
      credentials?.forEach((credential: ICredential) => {
        const issueePrefix = credential.sad.a.i;
        const aidIssuee = indentifiers.find((aid: IIdentifier) => {
          return aid.prefix === issueePrefix;
        });
        credential.issueeName = aidIssuee?.name!;
      });

      sendResponse({ data: { credentials: credentials ?? [] } });
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
