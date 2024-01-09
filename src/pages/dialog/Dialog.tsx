import React, { useState, useEffect } from "react";
import { APP_STATE } from "@pages/popup/constants";
import { PopupPrompt } from "./popupPrompt";
import { SigninItem } from "./signin";

export default function Dialog({ isConnected, tab, signins }): JSX.Element {
  const logo = chrome.runtime.getURL("src/assets/img/128_keri_logo.png");
  const [showPopupPrompt, setShowPopupPrompt] = useState(false);

  const handleSetState = async () => {
    await chrome.runtime.sendMessage({
      type: "tab",
      subtype: "set-tab-state",
      data: {
        appState: APP_STATE.SELECT_IDENTIFIER,
      },
    });
  };

  const handleClick = () => {
    handleSetState();
    setShowPopupPrompt(true);
  };
  useEffect(() => {
    if (!signins?.length) {
      handleSetState();
      setShowPopupPrompt(true);
    }
  }, []);

  return (
    <div className="absolute top-10 right-10 min-w-[300px] rounded text-center p-3 bg-white">
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
              Select another identifier
            </button>
          </>
        ) : null}
      </header>
    </div>
  );
}
