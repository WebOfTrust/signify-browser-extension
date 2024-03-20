import { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useIntl } from "react-intl";
import { Card, Button, Text, Input } from "@components/ui";
import EyeIcon from "@components/shared/icons/eye";
import EyeOffIcon from "@components/shared/icons/eye-off";
import { IMessage } from "@config/types";

interface ISignup {
  handleBootAndConnect: (passcode: string) => void;
  isLoading: boolean;
  signupError?: string;
}

const StyledGeneratedPassword = styled.p<{ blur: boolean }>`
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
      type: "authentication",
      subtype: "generate-passcode",
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
    <div className="p-4 relative">
      <div className="mb-2">
        <p className="text-sm font-bold">
          {generatedPasscode
            ? formatMessage({
                id: "signup.title.saveYourPasscode",
              })
            : formatMessage({
                id: "signup.title.generatePasscode",
              })}
        </p>
      </div>
      <div className="mb-2">
        <p className="text-xs font-bold">
          {formatMessage({
            id: "signup.desc.safegaurd",
          })}
        </p>
        <p className="text-xs font-bold">
          {formatMessage({
            id: "signup.desc.storeYourPasscode",
          })}
        </p>
      </div>
      <Card>
        <>
          <div className=" mb-2">
            <Text className="font-bold text-xs break-words" $color="heading">
              {formatMessage({ id: "signup.warning.cannotRetrieve" })}
            </Text>
          </div>

          {generatedPasscode ? (
            <Card>
              <div className="flex flex-row gap-x-1 justify-between text-xs">
                <StyledGeneratedPassword blur={!showPassword}>
                  {generatedPasscode}
                </StyledGeneratedPassword>
                <button
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <EyeIcon size={3} />
                  ) : (
                    <EyeOffIcon size={3} />
                  )}
                </button>
              </div>
            </Card>
          ) : (
            <></>
          )}
          <div className="mt-2">
            {generatedPasscode ? (
              copiedToClipboard ? (
                <div>
                  <div className="mb-1">
                    <Input
                      type="password"
                      id="passcode"
                      error={passcodeError}
                      placeholder={passcodeMessage}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      onBlur={onBlurPasscode}
                    />
                  </div>
                  <Button
                    isLoading={isLoading}
                    handleClick={handlingBootAndConnect}
                    className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
                  >
                    <p className="font-medium text-md">{connectMessage}</p>
                  </Button>
                </div>
              ) : (
                <Button
                  handleClick={() => {
                    navigator.clipboard.writeText(generatedPasscode);
                    setCopiedToClipboard(true);
                  }}
                  className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
                >
                  <p className="font-medium text-md">
                    {formatMessage({
                      id: "signup.action.copyToClipboard",
                    })}
                  </p>
                </Button>
              )
            ) : (
              <Button
                handleClick={handleGeneratePasscode}
                className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
              >
                <p className="font-medium text-md">
                  {formatMessage({ id: "signup.title.generatePasscode" })}
                </p>
              </Button>
            )}
          </div>
        </>
      </Card>
    </div>
  );
}
