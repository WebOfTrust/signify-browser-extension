import React, { useState, useEffect } from "react";
import { APP_STATE } from "@pages/popup/constants";
import { PopupPrompt } from "./popupPrompt";
import { SigninItem } from "./signin";

export default function Dialog({
  isConnected,
  tab,
  signins,
  eventType,
}): JSX.Element {
  const logo = chrome.runtime.getURL("src/assets/img/128_keri_logo.png");
  const [showPopupPrompt, setShowPopupPrompt] = useState(false);

  const setAppState = async () => {
    await chrome.runtime.sendMessage({
      type: "tab",
      subtype: "set-app-state",
      data: {
        appState:
          eventType === "init-req-identifier"
            ? APP_STATE.SELECT_IDENTIFIER
            : eventType === "init-req-credential"
            ? APP_STATE.SELECT_CREDENTIAL
            : APP_STATE.DEFAULT,
      },
    });
  };

  const handleClick = () => {
    setAppState();
    setShowPopupPrompt(true);
  };
  useEffect(() => {
    if (!signins?.length) {
      setAppState();
      setShowPopupPrompt(true);
    }
  }, []);

  return (
    <div className="absolute top-10 right-10 min-w-[300px] max-h-[540px] overflow-auto rounded text-center p-3 bg-white">
      <header className="items-center justify-center">
        <div className="flex flex-row gap-x-2 mb-2">
          <img src={logo} className="h-8" alt="logo" />
          <p className="text-2xl font-bold text-green">Sign in with KERI</p>
        </div>

        {showPopupPrompt ? (
          <PopupPrompt message="Select the KERI icon in your browser to proceed" />
        ) : null}
        {!signins?.length && isConnected ? (
          <p className=" text-sm text-green font-bold">
            {tab?.url} is requesting an ID
          </p>
        ) : null}

        {signins?.length && isConnected ? (
          <>
            {signins?.map((signin) => (
              <SigninItem signin={signin} />
            ))}
            <button
              onClick={handleClick}
              className="text-green font-bold text-sm cursor-pointer"
            >
              Select another{" "}
              {eventType === "init-req-identifier"
                ? "identifier"
                : "credential"}
            </button>
          </>
        ) : null}
      </header>
    </div>
  );
}
