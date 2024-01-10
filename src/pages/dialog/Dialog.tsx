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
    <div className="absolute top-10 right-10 w-[320px] max-h-[540px] overflow-auto pt-7 ">
      {showPopupPrompt ? (
        <PopupPrompt
          message={
            <p className="text-sm text-white">
              Open{" "}
              <span className="inline-block">
                <img src={logo} className="h-4" alt="logo" />
              </span>{" "}
              to proceed
            </p>
          }
        />
      ) : null}
      <div className="items-center justify-center rounded text-center p-3 bg-white">
        <div className="flex flex-row gap-x-2 mb-2">
          <img src={logo} className="h-8" alt="logo" />
          <p className="text-2xl font-bold text-green">Sign in with KERI</p>
        </div>
        {!signins?.length && isConnected ? (
          <p className="mt-2 text-sm text-green max-w-[280px] font-bold">
            <span className="">{tab?.url}</span> is requesting an{" "}
            {eventType === "init-req-identifier" ? "ID" : "credential"}
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
              Open{" "}
              <span className="inline-block">
                <img src={logo} className="h-4" alt="logo" />
              </span>{" "}
              to select other{" "}
              {eventType === "init-req-identifier"
                ? "identifier"
                : "credential"}{" "}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
