import { useState } from "react";
import logo from "@assets/img/128_keri_logo.png";

interface ISignin {
  vendorUrl?: string;
  passcode?: string;
  handleConnect: (vendorUrl?: string, passcode?: string) => void;
}

export function Signin(props: ISignin): JSX.Element {
  const [vendorUrl, setVendorUrl] = useState("");
  const [passcode, setPasscode] = useState("");

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="flex flex-row justify-between">
        <p>KERI</p>
        <div>Settings Icons</div>
      </div>
      <div className="flex flex-row justify-center">
        <img src={logo} className="w-32 h-32" alt="logo" />
      </div>
      <div>
        <input
          type="text"
          id="vendor_url"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Enter Keria url"
          required
          onChange={(e) => setVendorUrl(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          id="passcode"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Enter your passcode"
          required
          onChange={(e) => setPasscode(e.target.value)}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => props.handleConnect(vendorUrl, passcode)}
          className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
          Connect
        </button>
      </div>
      <div>
        <a
          href="#"
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          Don't have account?
        </a>
      </div>
      <div className="flex flex-row justify-center">
        <a
          href="#"
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          docs
        </a>
        <strong>|</strong>
        <a
          href="#"
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          support
        </a>
      </div>
    </div>
  );
}
