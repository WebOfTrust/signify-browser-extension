import { createRoot } from "react-dom/client";
import { SW_EVENTS } from "@config/event-types";
import { getExtId } from "@shared/runtime-utils";
import Popup from "@pages/popup/Popup";
import "@pages/popup/index.css";

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(<Popup />);

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (
      (sender.url?.startsWith("moz-extension://") ||
        sender.url?.startsWith("chrome-extension://")) &&
      sender.url?.endsWith("/service-worker-loader.js") &&
      sender.id === getExtId() &&
      request.type === SW_EVENTS.check_popup_open
    ) {
      sendResponse({ data: { isOpened: true } });
    }
  });
}

init();
