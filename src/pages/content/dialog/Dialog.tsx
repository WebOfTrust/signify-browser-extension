import browser from "webextension-polyfill";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ThemeProvider, styled } from "styled-components";
import { useIntl } from "react-intl";
import {
  Text,
  Box,
  Flex,
  IconButton,
  Subtext,
  Switch,
  Input,
  Radio,
  Button,
} from "@components/ui";
import { IVendorData, ISignin } from "@config/types";
import { CS_EVENTS } from "@config/event-types";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { getHostnameFromUrl } from "@shared/utils";
import { TAB_STATE } from "@pages/popup/constants";
import { setTabState } from "@pages/content";
import { resetTabState } from "@pages/content";
import { PopupPrompt } from "./popupPrompt";
import { SigninItem } from "./signin";
import { postMessage } from "../utils";

const StyledMain = styled(Box)`
  border: ${(props) =>
    `1px solid ${
      props.theme?.colors?.bodyBorder ?? props.theme?.colors?.bodyBg
    }`};
  background: ${(props) => props.theme?.colors?.bodyBg};
  color: ${(props) => props.theme?.colors?.bodyColor};
`;

const StyledClose = styled(IconButton)`
  position: absolute;
  top: 24px;
  left: 0px;
  font-size: 12px;
  padding: 4px 8px;
  text-align: center;
  border-radius: 50%;
  background: ${(props) => props.theme?.colors?.bodyBg};
  color: ${(props) => props.theme?.colors?.bodyColor};
  &:hover {
    background-color: #f55877;
    color: white;
  }
  border: ${(props) =>
    `1px solid ${
      props.theme?.colors?.bodyBorder ?? props.theme?.colors?.bodyBg
    }`};
`;

const StyledImgSpan = styled.span`
  display: inline-block;
`;

const StyledImg = styled.img`
  height: ${({ height }) => height};
`;

interface IDialog {
  isConnected: boolean;
  tabUrl: string;
  eventType: string;
  handleRemove: () => void;
  signins: ISignin[];
  vendorData: IVendorData;
  autoSigninObjExists?: boolean;
  requestId: string;
  rurl: string;
  sessionOneTime: boolean;
}

const StyledRequestor = styled(Flex)`
  border: 1px solid;
  padding: 8px;
  margin-bottom: 4px;
  overflow-wrap: anywhere;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme?.colors?.cardBg};
  color: ${(props) => props.theme?.colors?.cardColor};
`;

export function Dialog({
  isConnected = false,
  vendorData,
  tabUrl = "",
  signins = [],
  autoSigninObjExists,
  eventType = TAB_STATE.NONE,
  handleRemove,
  requestId,
  rurl,
  sessionOneTime,
}: IDialog): JSX.Element {
  const { formatMessage } = useIntl();
  const [sessionTime, setSessionTime] = useState(5);
  const [maxReq, setMaxReq] = useState(0);
  const [selectedSignin, setSelectedSignin] = useState<ISignin>();

  const logo =
    vendorData?.logo ??
    browser.runtime.getURL("src/assets/img/128_keri_logo.png");
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
    postMessage({
      type: "/signify/reply",
      error: "request has been cancelled",
      requestId,
      rurl,
    });
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

  const handleSignin = async () => {
    if (!selectedSignin) {
      return;
    }
    const { data, error } = await sendMessage<{
      rurl: string;
      signin: ISignin;
      config: { sessionOneTime: boolean };
    }>({
      type: CS_EVENTS.authentication_get_auth_data,
      data: {
        rurl,
        signin: selectedSignin,
        config: { sessionOneTime },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      resetTabState();
      // Communicate headers to web page
      postMessage({ type: "/signify/reply", requestId, payload: data });
    }
  };

  return (
    <ThemeProvider theme={vendorData?.theme}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
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
                <StyledImgSpan>
                  <StyledImg src={logo} height="16px" alt="logo" />
                </StyledImgSpan>{" "}
                {formatMessage({ id: "action.toProceed" })}
              </Text>
            }
          />
        ) : null}
        <StyledClose type="button" onClick={onClickRemove}>
          x
        </StyledClose>
        <StyledMain borderRadius="4px" textAlign="center" padding={3}>
          <Flex flexDirection="row" $flexGap={2} alignItems="center">
            <StyledImg src={logo} height="32px" alt="logo" />
            <Text fontWeight="bold" fontSize={3} $color="bodyColor">
              {formatMessage({ id: "signin.with" })} {vendorData?.title}
            </Text>
          </Flex>
          {showRequestAuthPrompt ? (
            <Box marginTop={2} maxWidth="280px">
              <StyledRequestor justifyContent="center">
                <Text $color="">{getHostnameFromUrl(tabUrl)}</Text>{" "}
              </StyledRequestor>
              <Text fontSize={1} fontWeight="bold" $color="bodyColor">
                {formatMessage({ id: "signin.requestAuth" })}{" "}
                {formatMessage({ id: getTextKeyByEventType() })}
              </Text>
            </Box>
          ) : (
            <>
              <Box marginTop={2}>
                <StyledRequestor padding={1}>
                  {eventType !== TAB_STATE.NONE ? (
                    <Box
                      onClick={handleClick}
                      fontWeight="bold"
                      fontSize={0}
                      $cursorPointer
                    >
                      {formatMessage({ id: "action.click" })}{" "}
                      <StyledImgSpan>
                        <StyledImg height="16px" src={logo} alt="logo" />
                      </StyledImgSpan>{" "}
                      {formatMessage({ id: "action.toSelectOther" })}{" "}
                      {formatMessage({ id: getTextKeyByEventType() })}
                    </Box>
                  ) : (
                    <></>
                  )}
                </StyledRequestor>
              </Box>

              {signins?.map((signin, index) => (
                <Radio
                  id={index}
                  checked={selectedSignin?.id === signin.id}
                  onClick={() => setSelectedSignin(signin)}
                  component={<SigninItem signin={signin} />}
                />
              ))}
              {signins?.length ? (
                <Box marginTop={2}>
                  <StyledRequestor padding={1}>
                    <Subtext fontSize={0} fontWeight="bold" $color="bodyColor">
                      {getHostnameFromUrl(tabUrl) +
                        (sessionOneTime
                          ? " is requesting a credential for one time request."
                          : " is requesting a credential. By signing in, you allow selected credential to sign subsequent requests ")}
                    </Subtext>
                    <Box marginTop={1}>
                      <Button
                        handleClick={handleSignin}
                        disabled={!selectedSignin}
                      >
                        {sessionOneTime
                          ? "Select Credential"
                          : "Sign in with Credential"}
                      </Button>
                    </Box>
                  </StyledRequestor>
                </Box>
              ) : null}
            </>
          )}
        </StyledMain>
      </Box>
    </ThemeProvider>
  );
}
