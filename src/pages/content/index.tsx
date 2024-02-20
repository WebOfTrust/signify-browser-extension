import { createRoot } from "react-dom/client";
import { LocaleProvider } from "@src/_locales";
import { IMessage } from "@pages/background/types";
import "./style.css";
import Dialog from "../dialog/Dialog";
import { TAB_STATE } from "../popup/constants";

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
          setTabState(TAB_STATE.DEFAULT);
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

          let filteredSignins: any[] = [];
          console.log(event.data.type);
          tabSigninResp?.data?.signins.forEach((signin: any) => {
            if (
              signin.identifier &&
              (event.data.type === TAB_STATE.SELECT_IDENTIFIER ||
                event.data.type === TAB_STATE.SELECT_ID_CRED)
            ) {
              filteredSignins.push(signin);
            }
            if (
              signin.credential &&
              (event.data.type === TAB_STATE.SELECT_CREDENTIAL ||
                event.data.type === TAB_STATE.SELECT_ID_CRED)
            ) {
              if (!event.data.schema || signin.credential.schema.id === event.data.schema){
                filteredSignins.push(signin);
              }
            }
          });

          insertDialog(
            data.isConnected,
            data.tabUrl,
            filteredSignins,
            event.data.type,
            tabSigninResp?.data?.autoSigninObj,
            respVendorData?.data?.vendorData
          );
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
  if (sender.origin === "chrome-extension://" + chrome.runtime.id) {
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
        insertDialog(
          data.isConnected,
          data.tabUrl,
          tabSigninResp?.data?.signins,
          message.eventType ?? "",
          tabSigninResp?.data?.autoSigninObj,
          respVendorData?.data?.vendorData
        );
      }
    }

    if (message.type === "tab" && message.subtype === "get-tab-state") {
      sendResponse({ data: { appState: getTabState() } });
    }

    if (message.type === "tab" && message.subtype === "set-tab-state") {
      setTabState(message.data.appState);
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
        autoSigninObj={autoSigninObj}
        eventType={eventType}
        removeDialog={removeDialog}
      />
    </LocaleProvider>
  );
}

function removeDialog() {
  const element = document.getElementById("__root");
  if (element) element.remove();
}

export function setTabState(state: string) {
  console.log("setTabState: " + state);
  tabState = state;
}

export function getTabState() {
  console.log("getTabState: " + tabState);
  return tabState;
}
