import { useState, useEffect } from "react";
import { ThemeProvider, styled } from "styled-components";
import { useIntl } from "react-intl";
import { Text, Subtext, Box, Flex, IconButton } from "@components/ui";
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
              <Text fontSize={1} fontWeight="bold" $color="bodyColor">
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
                <Box
                  onClick={handleClick}
                  fontWeight="bold"
                  fontSize={1}
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
            </>
          )}
        </StyledMain>
      </Box>
    </ThemeProvider>
  );
}
