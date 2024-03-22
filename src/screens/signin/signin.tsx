import { useState, useEffect } from "react";
import { styled } from "styled-components";
import { Button, Box, Flex, Input, Text } from "@components/ui";
import { useIntl } from "react-intl";

interface ISignin {
  passcode?: string;
  signinError?: string;
  handleConnect: (passcode: string) => void;
  isLoading?: boolean;
  logo?: string;
}

const StyledLogo = styled.img`
  width: 128px;
  height: 128px;
`;

export function Signin(props: ISignin): JSX.Element {
  const { formatMessage } = useIntl();
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const passcodeMessage = formatMessage({ id: "account.enterPasscode" });
  const connectMessage = formatMessage({ id: "action.connect" });

  useEffect(() => {
    if (props.signinError) {
      setPasscodeError(props.signinError);
    }
  }, [props.signinError]);

  const onBlurPasscode = () => {
    if (!passcode) {
      setPasscodeError(passcodeMessage);
    } else {
      setPasscodeError("");
    }
  };

  const handleConnect = async () => {
    let hasError = false;
    if (!passcode) {
      setPasscodeError(passcodeMessage);
      hasError = true;
    }

    if (!hasError) {
      await props.handleConnect(passcode);
    }
  };

  return (
    <>
      <Flex flexDirection="row" justifyContent="center">
        <StyledLogo src={props.logo} alt="logo" />
      </Flex>
      <Box paddingX={3} paddingY={2}>
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
      <Flex flexDirection="row" justifyContent="center">
        <Button handleClick={handleConnect} isLoading={props.isLoading}>
          <Text $color="">{connectMessage}</Text>
        </Button>
      </Flex>
    </>
  );
}
