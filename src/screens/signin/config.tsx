import { useState, useEffect } from "react";
import { configService } from "@pages/background/services/config";
import { isValidUrl } from "@pages/background/utils";

interface IConfig {
  afterSetUrl: () => void;
}

export function Config(props: IConfig): JSX.Element {
  const [vendorUrl, setVendorUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const getVendorUrl = async () => {
    const _vendorUrl = await configService.getUrl();
    setVendorUrl(_vendorUrl);
  };

  useEffect(() => {
    getVendorUrl();
  }, []);

  const onBlurUrl = () => {
    if (!vendorUrl || !isValidUrl(vendorUrl)) {
      setUrlError("Enter a valid url");
    } else {
      setUrlError("");
    }
  };

  const handleSetUrl = async () => {
    let hasError = false;
    if (!vendorUrl || !isValidUrl(vendorUrl)) {
      setUrlError("Enter a valid url");
      hasError = true;
    }

    if (!hasError) {
      await configService.setUrl(vendorUrl);
      props.afterSetUrl();
    }
  };

  return (
    <>
      <div className="px-4 py-2">
        <p className="text-sm font-bold text-gray-dark">Agent Url:</p>
        <input
          type="text"
          id="vendor_url"
          className={`border text-black text-sm rounded-lg block w-full p-2.5 ${
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
      <div className="flex flex-row justify-center">
        <button
          type="button"
          onClick={handleSetUrl}
          className="text-white bg-green flex flex-row gap-x-1 focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          <p className="font-medium text-md">Save</p>
        </button>
      </div>
    </>
  );
}
