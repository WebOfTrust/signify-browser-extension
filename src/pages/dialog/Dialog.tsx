import { useState, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { LocaleProvider } from "@src/_locales";
import { default as defaultMeta } from "@src/config/meta.json";
import { Button, Text, Subtext } from "@components/ui";
import { TAB_STATE } from "@pages/popup/constants";
import { PopupPrompt } from "./popupPrompt";
import { SigninItem } from "./signin";
import { setTabState } from "@pages/content/index";

export default function Dialog({
  isConnected = false,
  vendorData,
  tabUrl = "",
  signins = [],
  autoSigninObj,
  eventType = "",
  removeDialog,
}): JSX.Element {
  const logo =
    vendorData?.logo ??
    chrome.runtime.getURL("src/assets/img/128_keri_logo.png");
  const [showPopupPrompt, setShowPopupPrompt] = useState(false);
  const showRequestAuthPrompt =
    !signins.length ||
    (!autoSigninObj && eventType === TAB_STATE.SELECT_AUTO_SIGNIN) ||
    !isConnected;

  const getEventTypeAppState = () => {
    return eventType ?? TAB_STATE.DEFAULT;
  };

  const handleClick = () => {
    setTabState(getEventTypeAppState());
    setShowPopupPrompt(true);
  };

  useEffect(() => {
    if (
      !signins?.length ||
      (!autoSigninObj && eventType === TAB_STATE.SELECT_AUTO_SIGNIN)
    ) {
      setTabState(getEventTypeAppState());
      setShowPopupPrompt(true);
    } else if (!isConnected || !vendorData) {
      setTabState(TAB_STATE.DEFAULT);
      setShowPopupPrompt(true);
    }
  }, []);

  const handleRemove = () => {
    removeDialog();
  };

  const getTextByEventType = () => {
    switch (eventType) {
      case TAB_STATE.SELECT_CREDENTIAL:
        return "Credential";
      case TAB_STATE.SELECT_ID_CRED:
        return "AID or Credential";
      case TAB_STATE.SELECT_AUTO_SIGNIN:
        return "Auto Signin";
      default:
        return "AID";
    }
  };

  return (
    <LocaleProvider>
      <ThemeProvider theme={vendorData?.theme ?? defaultMeta.theme}>
        <div className="absolute top-10 right-10 w-[320px] max-h-[540px] overflow-auto pt-7">
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
          <button
            type="button"
            onClick={handleRemove}
            className=" absolute opacity-90 hover:opacity-100 top-4 left-0 hover:bg-red hover:text-white text-gray-dark bg-white font-medium rounded-full text-xs px-2 py-1 text-center"
          >
            {"x"}
          </button>
          {vendorData ? (
            <div className="items-center justify-center rounded text-center p-3 bg-white">
              <div className="flex flex-row gap-x-2 mb-2">
                <img src={logo} className="h-8" alt="logo" />
                <Text className="text-2xl font-bold" $color="primary">
                  Sign in with {vendorData?.title}
                </Text>
              </div>
              {showRequestAuthPrompt ? (
                <Text
                  className="mt-2 text-sm max-w-[280px] font-bold"
                  $color="primary"
                >
                  <Subtext className="" $color="">
                    {tabUrl}
                  </Subtext>{" "}
                  requests authentication with {getTextByEventType()}
                </Text>
              ) : (
                <>
                  {signins?.map((signin) => (
                    <SigninItem signin={signin} />
                  ))}
                  <Button
                    handleClick={handleClick}
                    className="font-bold text-sm cursor-pointer"
                  >
                    Open{" "}
                    <span className="inline-block">
                      <img src={logo} className="h-4" alt="logo" />
                    </span>{" "}
                    to select other {getTextByEventType()}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="items-center justify-center rounded text-center p-3 bg-white">
              <div className="flex flex-row gap-x-2 mb-2">
                <img src={logo} className="h-8" alt="logo" />
                <p className="text-xl font-bold text-red">
                  Vendor url is not set
                </p>
              </div>
            </div>
          )}
        </div>
      </ThemeProvider>
    </LocaleProvider>
  );
}
