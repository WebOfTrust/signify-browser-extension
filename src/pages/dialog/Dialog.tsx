import { useState, useEffect } from "react";
import { ThemeProvider, styled } from "styled-components";
import { useIntl } from "react-intl";
import { Text, Subtext, Box, Flex } from "@components/ui";
import { IVendorData, ISignin } from "@config/types";
import { TAB_STATE } from "@pages/popup/constants";
import { setTabState } from "@pages/content";
import { PopupPrompt } from "./popupPrompt";
import { SigninItem } from "./signin";

const StyledMain = styled(Box)`
  border: ${(props) =>
    `1px solid ${
      props.theme?.colors?.bodyBorder ?? props.theme?.colors?.bodyBg
    }`};
  background: ${(props) => props.theme?.colors?.bodyBg};
  color: ${(props) => props.theme?.colors?.bodyColor};
`;

interface IDialog {
  isConnected: boolean;
  tabUrl: string;
  eventType: string;
  handleRemove: () => void;
  signins: ISignin[];
  vendorData: IVendorData;
  autoSigninObjExists?: boolean;
}

export function Dialog({
  isConnected = false,
  vendorData,
  tabUrl = "",
  signins = [],
  autoSigninObjExists,
  eventType = TAB_STATE.NONE,
  handleRemove,
}: IDialog): JSX.Element {
  const { formatMessage } = useIntl();
  const logo =
    vendorData?.logo ??
    chrome.runtime.getURL("src/assets/img/128_keri_logo.png");
  const [showPopupPrompt, setShowPopupPrompt] = useState(false);
  const showRequestAuthPrompt =
    !signins?.length ||
    (!autoSigninObjExists && eventType === TAB_STATE.SELECT_AUTO_SIGNIN) ||
    !isConnected;

  const handleClick = () => {
    setShowPopupPrompt(true);
  };

  useEffect(() => {
    setTabState(eventType);
    if (showRequestAuthPrompt) {
      setShowPopupPrompt(true);
    }
  }, []);

  const onClickRemove = () => {
    handleRemove();
  };

  const getTextKeyByEventType = () => {
    switch (eventType) {
      case TAB_STATE.SELECT_CREDENTIAL:
        return "credential.title";
      case TAB_STATE.SELECT_ID_CRED:
        return "signin.aidOrCredential";
      case TAB_STATE.SELECT_AUTO_SIGNIN:
        return "signin.autoSignin";
      default:
        return "identifier.title";
    }
  };

  return (
    <ThemeProvider theme={vendorData?.theme}>
      {" "}
      <Box
        position="absolute"
        width="320px"
        maxHeight="540px"
        paddingTop={4}
        top="40px"
        right="40px"
        overflow="auto"
      >
        {showPopupPrompt ? (
          <PopupPrompt
            message={
              <Text fontSize={1} $color="subtext">
                {formatMessage({ id: "action.open" })}{" "}
                <span className="inline-block">
                  <img src={logo} className="h-4" alt="logo" />
                </span>{" "}
                {formatMessage({ id: "action.toProceed" })}
              </Text>
            }
          />
        ) : null}
        <button
          type="button"
          onClick={onClickRemove}
          className=" absolute opacity-90 hover:opacity-100 top-4 left-0 hover:bg-red hover:text-white text-gray-dark bg-white font-medium rounded-full text-xs px-2 py-1 text-center"
        >
          {"x"}
        </button>
        <StyledMain borderRadius="4px" textAlign="center" padding={3}>
          <Flex flexDirection="row" $flexGap={2} marginBottom={2}>
            <img src={logo} className="h-8" alt="logo" />
            <Text fontWeight="bold" fontSize={4} $color="bodyColor">
              {formatMessage({ id: "signin.with" })} {vendorData?.title}
            </Text>
          </Flex>
          {showRequestAuthPrompt ? (
            <Box marginTop={2} maxWidth="280px">
              <Text fontWeight="bold" $color="bodyColor">
                <Subtext $color="">{tabUrl}</Subtext>{" "}
                {formatMessage({ id: "signin.requestAuth" })}{" "}
                {formatMessage({ id: getTextKeyByEventType() })}
              </Text>
            </Box>
          ) : (
            <>
              {signins?.map((signin) => (
                <SigninItem signin={signin} />
              ))}
              {eventType !== TAB_STATE.NONE ? (
                <div
                  onClick={handleClick}
                  className="font-bold text-sm cursor-pointer"
                >
                  {formatMessage({ id: "action.click" })}{" "}
                  <span className="inline-block">
                    <img src={logo} className="h-4" alt="logo" />
                  </span>{" "}
                  {formatMessage({ id: "action.toSelectOther" })}{" "}
                  {formatMessage({ id: getTextKeyByEventType() })}
                </div>
              ) : (
                <></>
              )}
            </>
          )}
        </StyledMain>
      </Box>
    </ThemeProvider>
  );
}
