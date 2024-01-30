import { useState, useEffect } from "react";
import { configService } from "@pages/background/services/config";
import { isValidUrl } from "@pages/background/utils";

// This screen should not be styled with theme as it does not depend on the vendor configuration
export function Config(props): JSX.Element {
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
    try {
      const resp = await (await fetch(vendorUrl)).json();
      await configService.setData(resp);
      const imageBlob = await fetch(resp?.icon).then((r) => r.blob());
      const bitmap = await createImageBitmap(imageBlob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d");
      context?.drawImage(bitmap, 0, 0);
      const imageData = context?.getImageData(
        0,
        0,
        bitmap.width,
        bitmap.height
      );
      chrome.action.setIcon({ imageData: imageData });
    } catch (error) {
      setUrlError("Invalid url, Vendor configuration not found");
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
        <p className="text-sm font-bold">Agent Url:</p>
        <input
          type="text"
          id="vendor_url"
          className={`border text-black text-sm rounded-lg block w-full p-2.5 ${
            urlError ? " text-red border-red" : ""
          } `}
          placeholder="Enter vendor url"
          required
          value={vendorUrl}
          onChange={(e) => setVendorUrl(e.target.value)}
          onBlur={onBlurUrl}
        />
        {urlError ? <p className="text-red">{urlError}</p> : null}
      </div>
      <div className="flex flex-row justify-center">
        <button
          onClick={handleSetUrl}
          className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm"
        >
          <p className="font-medium text-md">Save</p>
        </button>
      </div>
    </>
  );
}
