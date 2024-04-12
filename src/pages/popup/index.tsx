import browser from "webextension-polyfill";
import { createRoot } from "react-dom/client";
import { SW_EVENTS } from "@config/event-types";
import { getExtId } from "@src/shared/browser/runtime-utils";
import Popup from "@pages/popup/Popup";
import "@pages/popup/index.css";

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(<Popup />);

  browser.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (
      sender.id === getExtId() &&
      !sender.tab &&
      request.type === SW_EVENTS.check_popup_open
    ) {
      return Promise.resolve({ data: { isOpened: true } });
    }
  });
}

init();
