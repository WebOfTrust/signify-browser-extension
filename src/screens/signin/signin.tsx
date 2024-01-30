import { useState } from "react";
import { Button } from "@components/ui";

interface ISignin {
  passcode?: string;
  handleConnect: (passcode?: string) => void;
  isLoading?: boolean;
  logo?: string;
}

export function Signin(props: ISignin): JSX.Element {
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const onBlurPasscode = () => {
    if (!passcode) {
      setPasscodeError("Enter your passcode");
    } else {
      setPasscodeError("");
    }
  };

  const handleConnect = async () => {
    let hasError = false;
    if (!passcode) {
      setPasscodeError("Enter your passcode");
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
        <input
          type="password"
          id="passcode"
          className={`border text-black text-sm rounded-lg block w-full p-2.5 ${
            passcodeError ? " text-red border-red" : ""
          }`}
          placeholder="Enter your passcode"
          required
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          onBlur={onBlurPasscode}
        />
        {passcodeError ? <p className="text-red">{passcodeError}</p> : null}
      </div>
      <div className="flex flex-row justify-center">
        <Button
          handleClick={handleConnect}
          isLoading={props.isLoading}
          className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-5 py-2.5"
        >
          <p className="font-medium text-md">Connect</p>
        </Button>
      </div>
    </>
  );
}
