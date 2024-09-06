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
import { SessionInfo } from "./session-info/session-info";

var tabState = TAB_STATE.NONE;
let requestId = "";
let rurl = "";

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

          requestId = event?.data?.requestId ?? "";
          rurl = event?.data?.rurl ?? rurl;
          insertDialog(
            data.isConnected,
            data.tabUrl,
            filteredSignins,
            event.data.type,
            tabSigninResp?.data?.autoSigninObj,
            respVendorData?.data?.vendorData,
            requestId,
            rurl
          );
          break;
        case TAB_STATE.CONFIGURE_VENDOR:
          await sendMessage({
            type: CS_EVENTS.action_icon_set,
          });
          await sendMessageWithExtId<{ vendorUrl: string }>(getExtId(), {
            type: CS_EVENTS.vendor_info_provide_config_url,
            data: {
              vendorUrl: event.data.payload.url,
            },
          });
          break;
        case TAB_STATE.AUTHORIZE_AUTO_SIGNIN:
          const { data: autoSigninData, error } = await sendMessageWithExtId<{
            rurl?: string;
          }>(getExtId(), {
            type: CS_EVENTS.fetch_resource_auto_signin_signature,
            data: {},
          });
          requestId = event?.data?.requestId ?? "";
          rurl = event?.data?.rurl ?? rurl;

          if (error) {
            if (error.code === 404) {
              window.postMessage(
                { type: "select-auto-signin", requestId, rurl },
                "*"
              );
            }
          } else {
            window.postMessage(
              {
                type: "/signify/reply",
                payload: autoSigninData,
                requestId,
                rurl,
              },
              "*"
            );
          }
          break;
        case TAB_STATE.SIGN_REQUEST:
          const { data: signedHeaders, error: signedHeadersError } =
            await sendMessageWithExtId<{
              rurl?: string;
            }>(getExtId(), {
              type: CS_EVENTS.fetch_resource_signed_headers,
              data: event.data.payload,
            });
          requestId = event?.data?.requestId ?? "";
          rurl = event?.data?.rurl ?? rurl;
          console.log("signedHeaders", signedHeaders);
          if (signedHeadersError) {
            window.postMessage(
              {
                type: "/signify/reply",
                error: signedHeadersError?.message,
                requestId,
                rurl,
              },
              "*"
            );
          } else {
            window.postMessage(
              {
                type: "/signify/reply",
                payload: signedHeaders,
                requestId,
                rurl,
              },
              "*"
            );
          }

          break;
        case TAB_STATE.GET_SESSION_INFO:
          const sessionInfo = await sendMessageWithExtId(getExtId(), {
            type: CS_EVENTS.authentication_get_session_info,
          });

          const vendorData = await sendMessage({
            type: CS_EVENTS.vendor_info_get_vendor_data,
          });

          const agentConnection = await sendMessage({
            type: CS_EVENTS.authentication_check_agent_connection,
          });

          requestId = event?.data?.requestId ?? "";
          console.log("sessionInfo", sessionInfo);
          if (sessionInfo?.error) {
            window.postMessage(
              {
                type: "/signify/reply",
                error: sessionInfo?.error?.message,
                requestId,
                rurl,
              },
              "*"
            );
          } else {
            window.postMessage(
              {
                type: "/signify/reply",
                payload: sessionInfo?.data,
                requestId,
                rurl,
              },
              "*"
            );
            if (sessionInfo?.data) {
              insertSessionInfo(
                agentConnection?.data?.isConnected,
                vendorData?.data?.vendorData,
                sessionInfo?.data
              );
            }
          }
          break;
        case TAB_STATE.CLEAR_SESSION:
          const clearSession = await sendMessageWithExtId(getExtId(), {
            type: CS_EVENTS.authentication_clear_session,
          });

          if (!clearSession?.data) {
            removeSessionInfo();
          }
          requestId = event?.data?.requestId ?? "";
          if (clearSession?.error) {
            window.postMessage(
              {
                type: "/signify/reply",
                error: clearSession?.error?.message,
                requestId,
                rurl,
              },
              "*"
            );
          } else {
            window.postMessage(
              {
                type: "/signify/reply",
                payload: clearSession?.data,
                requestId,
                rurl,
              },
              "*"
            );
          }

          break;
        case TAB_STATE.CREATE_DATA_ATTEST_CRED:
          const { data: credData, error: attestCredError } =
            await sendMessageWithExtId<{
              rurl?: string;
            }>(getExtId(), {
              type: CS_EVENTS.create_resource_data_attestation_credential,
              data: event.data.payload,
            });
          requestId = event?.data?.requestId ?? "";
          rurl = event?.data?.rurl ?? rurl;

          console.log("create attest credential resp data", credData);
          if (attestCredError) {
            window.postMessage(
              {
                type: "/signify/reply",
                error: attestCredError?.message,
                requestId,
                rurl,
              },
              "*"
            );
          } else {
            window.postMessage(
              {
                type: "/signify/reply",
                payload: credData,
                requestId,
                rurl,
              },
              "*"
            );
          }

          break;
        case TAB_STATE.GET_CREDENTIAL:
          const { data: cred, error: credError } = await sendMessageWithExtId<{
            rurl?: string;
          }>(getExtId(), {
            type: CS_EVENTS.fetch_resource_credential,
            data: event.data.payload,
          });
          requestId = event?.data?.requestId ?? "";
          rurl = event?.data?.rurl ?? rurl;

          console.log("get credential result", cred);
          if (credError) {
            window.postMessage(
              {
                type: "/signify/reply",
                error: credError?.message,
                requestId,
                rurl,
              },
              "*"
            );
          } else {
            window.postMessage(
              {
                type: "/signify/reply",
                payload: cred,
                requestId,
                rurl,
              },
              "*"
            );
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
          respVendorData?.data?.vendorData,
          requestId,
          rurl
        );
      }
    }

    if (message.type === "tab" && message.subtype === "get-tab-state") {
      return Promise.resolve({ data: { tabState: getTabState() } });
    }

    if (message.type === "tab" && message.subtype === "set-tab-state") {
      setTabState(message.data.tabState);
    }

    if (message.type === "tab" && message.subtype === "session-info") {
      const respVendorData = await sendMessage({
        type: CS_EVENTS.vendor_info_get_vendor_data,
      });

      const { data } = await sendMessage({
        type: CS_EVENTS.authentication_check_agent_connection,
      });

      if (message.data) {
        insertSessionInfo(
          data.isConnected,
          respVendorData?.data?.vendorData,
          message.data
        );
      }
    }
  }
});

function insertDialog(
  isConnected: boolean,
  tabUrl: string,
  signins: any,
  eventType: string,
  autoSigninObj: any,
  vendorData: any,
  requestId: string,
  rurl: string
) {
  let rootContainer = document.querySelector("#__root");

  if (!rootContainer) {
    const div = document.createElement("div");
    div.id = "__root";
    document.body.appendChild(div);
    rootContainer = document.querySelector("#__root");
  }

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
        requestId={requestId}
        rurl={rurl}
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

const SESSION_INFO = "__signify-session-info";
function removeSessionInfo() {
  const element = document.getElementById(SESSION_INFO);
  if (element) element.remove();
}

function insertSessionInfo(isConnected: boolean, vendorData: any, data: any) {
  let rootContainer = document.querySelector(`#${SESSION_INFO}`);

  if (!rootContainer) {
    const div = document.createElement("div");
    div.id = SESSION_INFO;
    document.body.appendChild(div);
    rootContainer = document.querySelector(`#${SESSION_INFO}`);
  }

  const root = createRoot(rootContainer!);
  root.render(
    <LocaleProvider>
      <SessionInfo
        isConnected={isConnected}
        vendorData={vendorData}
        data={data}
        handleRemove={removeSessionInfo}
      />
    </LocaleProvider>
  );
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
  if (!signins?.length) return [];

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
