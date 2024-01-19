import { useState } from "react";
import logo from "@assets/img/128_keri_logo.png";
import { Loader } from "@components/loader";

interface ISignin {
  passcode?: string;
  handleConnect: (passcode?: string) => void;
  isLoading?: boolean;
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
        <img src={logo} className="w-32 h-32" alt="logo" />
      </div>
      <div className=" px-4 py-2">
        <input
          type="password"
          id="passcode"
          className={`bg-gray-50 border text-black border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
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
        <button
          type="button"
          onClick={handleConnect}
          className="text-white bg-green flex flex-row gap-x-1 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          {props.isLoading ? <Loader size={4} /> : null}
          <p className="font-medium text-md">Connect</p>
        </button>
      </div>
    </>
  );
}
