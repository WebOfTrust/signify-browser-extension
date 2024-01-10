import { createRoot } from "react-dom/client";
import { IMessage } from "@pages/background/types";
import "./style.css";
import Dialog from "../dialog/Dialog";

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
        case "init-req-identifier":
        case "init-req-credential":
          // const manifest = chrome.runtime.getManifest();
          const loginBtn = document.getElementById("login-btn");
          const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
            type: "authentication",
            subtype: "check-agent-connection",
          });
          if (loginBtn) {
            const tabSigninResp = await chrome.runtime.sendMessage<
              IMessage<void>
            >({
              type: "fetch-resource",
              subtype: "tab-signin",
            });
            insertDialog({
              ...data,
              signins: tabSigninResp?.data?.signins,
              eventType: event.data.type,
            });
          } else {
            removeAlertComponent();
          }
          break;
      }
    }
  },
  false
);

// Handle messages from background script
chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (sender.origin === "chrome-extension://" + chrome.runtime.id) {
    // handle messages from Popup
    console.log(
      "Message received from browser extension: " +
        message.type +
        " " +
        message.subtype
    );
    if (message.type === "tab" && message.subtype === "reload-state") {
      removeAlertComponent();
      const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
        type: "authentication",
        subtype: "check-agent-connection",
      });
      const tabSigninResp = await chrome.runtime.sendMessage<IMessage<void>>({
        type: "fetch-resource",
        subtype: "tab-signin",
      });
      insertDialog({
        ...data,
        signins: tabSigninResp?.data?.signins,
        eventType: "init-req-identifier",
      });
    }
  }
});

function insertDialog(data: any) {
  console.log("inserting dialog");
  const div = document.createElement("div");
  div.id = "__root";
  document.body.appendChild(div);

  const rootContainer = document.querySelector("#__root");
  const root = createRoot(rootContainer!);
  root.render(
    <Dialog
      isConnected={data.isConnected}
      tab={data?.meta?.tab}
      signins={data.signins}
      eventType={data.eventType}
    />
  );
}

function removeAlertComponent() {
  const element = document.getElementById("__root");
  if (element) element.remove();
}
