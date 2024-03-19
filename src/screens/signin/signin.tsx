import { useState, useEffect } from "react";
import { Button, Input } from "@components/ui";
import { useIntl } from "react-intl";

interface ISignin {
  passcode?: string;
  signinError?: string;
  handleConnect: (passcode: string) => void;
  isLoading?: boolean;
  logo?: string;
}

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
      <div className="flex flex-row justify-center">
        <img src={props.logo} className="w-32 h-32" alt="logo" />
      </div>
      <div className=" px-4 py-2">
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
      <div className="flex flex-row justify-center">
        <Button
          handleClick={handleConnect}
          isLoading={props.isLoading}
          className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-5 py-2.5"
        >
          <p className="font-medium text-md">{connectMessage}</p>
        </Button>
      </div>
    </>
  );
}
