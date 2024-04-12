import browser from "webextension-polyfill";
import { createRoot } from "react-dom/client";
import { LocaleProvider } from "@src/_locales";
import { CS_EVENTS } from "@config/event-types";
import {
  getExtId,
  sendMessage,
  sendMessageWithExtId,
} from "@src/shared/browser/runtime-utils";
import { TAB_STATE } from "@pages/popup/constants";
import { Dialog } from "./dialog/Dialog";

var tabState = TAB_STATE.NONE;

// Advertize extensionId to web page
window.postMessage(
  {
    type: "signify-extension",
    data: {
      extensionId: getExtId(),
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
          await sendMessage({
            type: CS_EVENTS.action_icon_set_tab,
          });
          const respVendorData = await sendMessage({
            type: CS_EVENTS.vendor_info_get_vendor_data,
          });
          const { data } = await sendMessage({
            type: CS_EVENTS.authentication_check_agent_connection,
          });
          const tabSigninResp = await sendMessage({
            type: CS_EVENTS.fetch_resource_tab_signin,
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
            await sendMessage({
              type: CS_EVENTS.action_icon_set,
            });
            await sendMessageWithExtId<{ vendorUrl: string }>(getExtId(), {
              type: CS_EVENTS.vendor_info_attempt_set_vendor_url,
              data: {
                vendorUrl: event.data.data.vendorUrl,
              },
            });
          }
          break;
        case "fetch-resource":
          if (event.data.subtype === "auto-signin-signature") {
            const { data, error } = await sendMessageWithExtId(getExtId(), {
              type: CS_EVENTS.fetch_resource_auto_signin_signature,
            });
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
browser.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (sender.id === getExtId()) {
    console.log(
      "Content script received message from browser extension: " +
        message.type +
        ":" +
        message.subtype
    );
    if (message.type === "tab" && message.subtype === "reload-state") {
      if (getTabState() !== TAB_STATE.NONE) {
        removeDialog();
        const respVendorData = await sendMessage({
          type: CS_EVENTS.vendor_info_get_vendor_data,
        });

        const { data } = await sendMessage({
          type: CS_EVENTS.authentication_check_agent_connection,
        });
        const tabSigninResp = await sendMessage({
          type: CS_EVENTS.fetch_resource_tab_signin,
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
      return Promise.resolve({ data: { tabState: getTabState() } });
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

  sendMessage({
    type: CS_EVENTS.action_icon_unset_tab,
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
