import { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useIntl } from "react-intl";
import { UI_EVENTS } from "@config/event-types";
import {
  Box,
  Card,
  Button,
  Flex,
  Text,
  Input,
  IconButton,
} from "@components/ui";
import EyeIcon from "@components/shared/icons/eye";
import EyeOffIcon from "@components/shared/icons/eye-off";
import { IMessage } from "@config/types";

interface ISignup {
  handleBootAndConnect: (passcode: string) => void;
  isLoading: boolean;
  signupError?: string;
}

const StyledGeneratedPassword = styled.p<{ blur: boolean }>`
  margin: 0;
  ${({ blur, theme }) =>
    blur &&
    css`
      color: transparent;
      text-shadow: 0 0 8px ${theme?.colors?.cardColor};
    `}
`;

export function Signup({
  handleBootAndConnect,
  isLoading,
  signupError,
}: ISignup): JSX.Element {
  const [generatedPasscode, setGeneratedPasscode] = useState("");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { formatMessage } = useIntl();
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const passcodeMessage = formatMessage({ id: "account.enterPasscode" });
  const connectMessage = formatMessage({ id: "action.connect" });

  useEffect(() => {
    if (signupError) {
      setPasscodeError(signupError);
    }
  }, [signupError]);

  const onBlurPasscode = () => {
    if (!passcode) {
      setPasscodeError(passcodeMessage);
    } else {
      setPasscodeError("");
    }
  };

  const handleGeneratePasscode = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: UI_EVENTS.authentication_generate_passcode,
    });
    if (data?.passcode) {
      setGeneratedPasscode(data.passcode);
    }
  };

  const handlingBootAndConnect = async () => {
    let hasError = false;
    if (!passcode) {
      setPasscodeError(passcodeMessage);
      hasError = true;
    }

    if (!hasError) {
      await handleBootAndConnect(passcode);
    }
  };

  return (
    <Box padding={3} position="relative">
      <Box marginBottom={2}>
        <Text fontSize={1} $color="" fontWeight="bold">
          {generatedPasscode
            ? formatMessage({
                id: "signup.title.saveYourPasscode",
              })
            : formatMessage({
                id: "signup.title.generatePasscode",
              })}
        </Text>
      </Box>
      <Box marginBottom={2}>
        <Text $color="" fontSize={0} fontWeight="bold">
          {formatMessage({
            id: "signup.desc.safegaurd",
          })}
        </Text>
        <Text $color="" fontSize={0} fontWeight="bold">
          {formatMessage({
            id: "signup.desc.storeYourPasscode",
          })}
        </Text>
      </Box>
      <Card>
        <>
          <Box marginBottom={2}>
            <Text fontSize={0} fontWeight="bold" $breakWord $color="heading">
              {formatMessage({ id: "signup.warning.cannotRetrieve" })}
            </Text>
          </Box>

          {generatedPasscode ? (
            <Card>
              <Flex
                flexDirection="row"
                justifyContent="space-between"
                fontSize={0}
                $flexGap={1}
              >
                <StyledGeneratedPassword blur={!showPassword}>
                  {generatedPasscode}
                </StyledGeneratedPassword>
                <IconButton
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <EyeIcon size={3} />
                  ) : (
                    <EyeOffIcon size={3} />
                  )}
                </IconButton>
              </Flex>
            </Card>
          ) : (
            <></>
          )}
          <Box marginTop={2}>
            {generatedPasscode ? (
              copiedToClipboard ? (
                <div>
                  <Box marginBottom={1}>
                    <Input
                      type="password"
                      id="passcode"
                      error={passcodeError}
                      placeholder={passcodeMessage}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      onBlur={onBlurPasscode}
                    />
                  </Box>
                  <Button
                    isLoading={isLoading}
                    handleClick={handlingBootAndConnect}
                  >
                    <Text fontWeight="normal" $color="">
                      {connectMessage}
                    </Text>
                  </Button>
                </div>
              ) : (
                <Button
                  handleClick={() => {
                    navigator.clipboard.writeText(generatedPasscode);
                    setCopiedToClipboard(true);
                  }}
                >
                  <Text fontWeight="normal" $color="">
                    {formatMessage({
                      id: "signup.action.copyToClipboard",
                    })}
                  </Text>
                </Button>
              )
            ) : (
              <Button handleClick={handleGeneratePasscode}>
                <Text fontWeight="normal" $color="">
                  {formatMessage({ id: "signup.title.generatePasscode" })}
                </Text>
              </Button>
            )}
          </Box>
        </>
      </Card>
    </Box>
  );
}
