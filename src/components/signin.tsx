import { useState, useEffect } from "react";
import logo from "@assets/img/128_keri_logo.png";
import { isValidUrl } from "@pages/background/utils";

interface ISignin {
  vendorUrl?: string;
  passcode?: string;
  handleConnect: (vendorUrl?: string, passcode?: string) => void;
}

export function Signin(props: ISignin): JSX.Element {
  const [vendorUrl, setVendorUrl] = useState(props?.vendorUrl);
  const [passcode, setPasscode] = useState("");

  const [urlError, setUrlError] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  useEffect(() => {
    setVendorUrl(props.vendorUrl);
  }, [props.vendorUrl]);

  const onBlurUrl = () => {
    if (!vendorUrl || !isValidUrl(vendorUrl)) {
      setUrlError("Enter a valid url");
    } else {
      setUrlError("");
    }
  };

  const onBlurPasscode = () => {
    if (!passcode) {
      setPasscodeError("Enter your passcode");
    } else {
      setPasscodeError("");
    }
  };

  const handleConnect = () => {
    let hasError = false;
    if (!vendorUrl || !isValidUrl(vendorUrl)) {
      setUrlError("Enter a valid url");
      hasError = true;
    }

    if (!passcode) {
      setPasscodeError("Enter your passcode");
      hasError = true;
    }

    if (!hasError) {
      props.handleConnect(vendorUrl, passcode);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="flex flex-row justify-between p-2">
        <p className="text-xl text-green capitalize font-bold">KERI</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </div>
      <div className="flex flex-row justify-center">
        <img src={logo} className="w-32 h-32" alt="logo" />
      </div>
      <div className=" px-4 py-2">
        <input
          type="text"
          id="vendor_url"
          className={`bg-gray-50 border text-black border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
            urlError ? " text-red border-red" : ""
          } `}
          placeholder="Enter Keria url"
          required
          value={vendorUrl}
          onChange={(e) => setVendorUrl(e.target.value)}
          onBlur={onBlurUrl}
        />
        {urlError ? <p className="text-red">{urlError}</p> : null}
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
          className="text-white bg-green hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Connect
        </button>
      </div>
      <div className="flex flex-row justify-center">
        <a href="#" className="font-medium text-blue-600 hover:underline">
          Don't have account?
        </a>
      </div>
      <div className="flex flex-row justify-center">
        <a href="#" className="font-medium text-blue-600 hover:underline">
          docs
        </a>
        <strong>|</strong>
        <a href="#" className="font-medium text-blue-600 hover:underline">
          support
        </a>
      </div>
    </div>
  );
}
