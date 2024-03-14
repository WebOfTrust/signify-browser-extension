import { createRoot } from "react-dom/client";
import { LocaleProvider } from "@src/_locales";
import { IMessage } from "@config/types";
import { TAB_STATE } from "@pages/popup/constants";
import { Dialog } from "../dialog/Dialog";
import "./style.css";

var tabState = TAB_STATE.NONE;

// Advertize extensionId to web page
window.postMessage(
  {
    type: "signify-extension",
    data: {
      extensionId: chrome.runtime.id,
    },
  },
  "*"
);

// Handle messages from web page
window.addEventListener(
  "message",
  async (event) => {
    // Accept messages only from same window
    if (event.source !== window) {
      return;
    }
    console.log("Content script received from web page: " + event.data.type);
    if (event.data.type) {
      switch (event.data.type) {
        case TAB_STATE.SELECT_IDENTIFIER:
        case TAB_STATE.SELECT_CREDENTIAL:
        case TAB_STATE.SELECT_ID_CRED:
        case TAB_STATE.SELECT_AUTO_SIGNIN:
          await chrome.runtime.sendMessage<IMessage<void>>({
            type: "action-icon",
            subtype: "set-tab-action-icon",
          });
          const respVendorData = await chrome.runtime.sendMessage<
            IMessage<void>
          >({
            type: "vendor-info",
            subtype: "get-vendor-data",
          });
          const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
            type: "authentication",
            subtype: "check-agent-connection",
          });
          const tabSigninResp = await chrome.runtime.sendMessage<
            IMessage<void>
          >({
            type: "fetch-resource",
            subtype: "tab-signin",
          });

          const filteredSignins = getFilteredSignins(
            tabSigninResp?.data?.signins,
            event.data.type,
            event.data.schema
          );

          insertDialog(
            data.isConnected,
            data.tabUrl,
            filteredSignins,
            event.data.type,
            tabSigninResp?.data?.autoSigninObj,
            respVendorData?.data?.vendorData
          );
          break;
        case "vendor-info":
          if (event.data.subtype === "attempt-set-vendor-url") {
            await chrome.runtime.sendMessage<IMessage<void>>({
              type: "action-icon",
              subtype: "set-action-icon",
            });
            await chrome.runtime.sendMessage(chrome.runtime.id, {
              type: "vendor-info",
              subtype: "attempt-set-vendor-url",
              data: {
                vendorUrl: event.data.data.vendorUrl,
              },
            });
          }
          break;
        case "fetch-resource":
          if (event.data.subtype === "auto-signin-signature") {
            const { data, error } = await chrome.runtime.sendMessage(
              chrome.runtime.id,
              {
                type: "fetch-resource",
                subtype: "auto-signin-signature",
              }
            );
            if (error) {
              window.postMessage({ type: "select-auto-signin" }, "*");
            } else {
              window.postMessage(
                { type: "signify-signature", data: data },
                "*"
              );
            }
          }

          break;
        default:
          break;
      }
    }
  },
  false
);

// Handle messages from background script and popup
chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (
    (sender.url?.startsWith("moz-extension://") ||
      sender.origin?.startsWith("chrome-extension://")) &&
    sender.id === chrome.runtime.id
  ) {
    console.log(
      "Message received from browser extension: " +
        message.type +
        ":" +
        message.subtype
    );
    if (message.type === "tab" && message.subtype === "reload-state") {
      if (getTabState() !== TAB_STATE.NONE) {
        removeDialog();
        const respVendorData = await chrome.runtime.sendMessage<IMessage<void>>(
          {
            type: "vendor-info",
            subtype: "get-vendor-data",
          }
        );

        const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
          type: "authentication",
          subtype: "check-agent-connection",
        });
        const tabSigninResp = await chrome.runtime.sendMessage<IMessage<void>>({
          type: "fetch-resource",
          subtype: "tab-signin",
        });
        const filteredSignins = getFilteredSignins(
          tabSigninResp?.data?.signins,
          message.eventType,
          message.schema
        );
        insertDialog(
          data.isConnected,
          data.tabUrl,
          filteredSignins,
          message.eventType ?? "",
          tabSigninResp?.data?.autoSigninObj,
          respVendorData?.data?.vendorData
        );
      }
    }

    if (message.type === "tab" && message.subtype === "get-tab-state") {
      if (sender.origin?.startsWith("chrome-extension://")) {
        sendResponse({ data: { tabState: getTabState() } });
      } else {
        return Promise.resolve({ data: { tabState: getTabState() } });
      }
    }

    if (message.type === "tab" && message.subtype === "set-tab-state") {
      setTabState(message.data.tabState);
    }
  }
});

function insertDialog(
  isConnected: boolean,
  tabUrl: string,
  signins: any,
  eventType: string,
  autoSigninObj: any,
  vendorData: any
) {
  const div = document.createElement("div");
  div.id = "__root";
  document.body.appendChild(div);

  const rootContainer = document.querySelector("#__root");
  const root = createRoot(rootContainer!);
  root.render(
    <LocaleProvider>
      <Dialog
        isConnected={isConnected}
        vendorData={vendorData}
        tabUrl={tabUrl}
        signins={signins}
        autoSigninObjExists={!!autoSigninObj}
        eventType={eventType}
        handleRemove={resetTabState}
      />
    </LocaleProvider>
  );
}

function removeDialog() {
  const element = document.getElementById("__root");
  if (element) element.remove();

  chrome.runtime.sendMessage<IMessage<void>>({
    type: "action-icon",
    subtype: "unset-tab-action-icon",
  });
}

export function resetTabState() {
  removeDialog();
  setTabState(TAB_STATE.NONE);
}

// TODO: proper types for these params
function getFilteredSignins(
  signins: any,
  currentTabState: any,
  credentialSchema: any
) {
  let filteredSignins: any[] = [];
  signins.forEach((signin: any) => {
    if (
      signin.identifier &&
      (currentTabState === TAB_STATE.SELECT_IDENTIFIER ||
        currentTabState === TAB_STATE.SELECT_ID_CRED)
    ) {
      filteredSignins.push(signin);
    }
    if (
      signin.credential &&
      (currentTabState === TAB_STATE.SELECT_CREDENTIAL ||
        currentTabState === TAB_STATE.SELECT_ID_CRED)
    ) {
      if (
        !credentialSchema ||
        signin.credential.schema.id === credentialSchema
      ) {
        filteredSignins.push(signin);
      }
    }
  });
  return filteredSignins;
}

export function setTabState(state: string) {
  console.log("setTabState: " + state);
  tabState = state;
}

export function getTabState() {
  console.log("getTabState: " + tabState);
  return tabState;
}
