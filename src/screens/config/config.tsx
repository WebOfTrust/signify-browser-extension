import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { configService } from "@pages/background/services/config";
import { useLocale, languageCodeMap } from "@src/_locales";
import { isValidUrl } from "@pages/background/utils";
import { Button, Dropdown } from "@components/ui";

const langMap = Object.entries(languageCodeMap).map((s) => ({
  label: s[1],
  value: s[0],
}));

export function Config(props:any): JSX.Element {
  const [vendorUrl, setVendorUrl] = useState("");
  const [vendorUrlError, setVendorUrlError] = useState("");
  const [agentUrl, setAgentUrl] = useState("");
  const [agentUrlError, setAgentUrlError] = useState("");

  const [vendorData, setVendorData] = useState();

  const { formatMessage } = useIntl();
  const { changeLocale, currentLocale } = useLocale();
  const validUrlMsg = formatMessage({ id: "config.error.enterUrl" });
  const invalidVendorUrlError = formatMessage({
    id: "config.error.invalidVendorUrl",
  });

  const getVendorInfo = async () => {
    const response = await configService.getAgentAndVendorInfo();
    setVendorUrl(response.vendorUrl);
    setAgentUrl(response.agentUrl);
    setVendorData(response.vendorData);
  };

  useEffect(() => {
    getVendorInfo();
  }, []);

  const checkErrorVendorUrl = () => {
    if (!vendorUrl || !isValidUrl(vendorUrl)) {
      setVendorUrlError(validUrlMsg);
      return true;
    } else {
      setVendorUrlError("");
      return false;
    }
  };

  const checkErrorAgentUrl = (_url) => {
    if (!_url || !isValidUrl(_url)) {
      setAgentUrlError(validUrlMsg);
      return true;
    }
  };

  const handleSetAgentUrl = async (_url) => {
    const hasError = (_url);
    if (!hasError) {
      await configService.setAgentUrl(_url);
      setAgentUrl(_url);
      setAgentUrlError("");
    }
  };

  const handleSetVendorUrl = async () => {
    let hasError = checkErrorVendorUrl();
    try {
      const resp = await (await fetch(vendorUrl)).json();
      handleSetAgentUrl(resp?.agentUrl);
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
      setVendorUrlError(invalidVendorUrlError);
      hasError = true;
    }
    if (!hasError) {
      await configService.setUrl(vendorUrl);
      props.afterSetUrl();
    }
  };

  const handleSave = async () => {
    const hasError = checkErrorVendorUrl();
    if (hasError) return;
    await handleSetVendorUrl();
  };

  const handleBack = async () => {
    const hasError = checkErrorAgentUrl(agentUrl);
    if (hasError) return;
    props.handleBack();
  };

  return (
    <>
      {vendorData ? (
        <div className="flex flex-row justify-between px-2">
          <button
            onClick={handleBack}
            className="cursor-pointer underline font-medium"
          >
            {formatMessage({ id: "action.back" })}
          </button>
        </div>
      ) : (
        <></>
      )}
      <div className="px-4 relative mb-2">
        <p className="text-sm font-bold">
          {formatMessage({ id: "config.vendorUrl.label" })}
        </p>
        <input
          type="text"
          id="vendor_url"
          className={`border text-black text-sm rounded-lg block w-full p-2.5 ${
            vendorUrlError ? " text-red border-red" : ""
          } `}
          placeholder={formatMessage({ id: "config.vendorUrl.placeholder" })}
          required
          value={vendorUrl}
          onChange={(e) => setVendorUrl(e.target.value)}
          onBlur={checkErrorVendorUrl}
        />
        {vendorUrlError ? <p className="text-red">{vendorUrlError}</p> : null}
        <div className="absolute right-[16px] bottom-[-28px]">
          <Button
            handleClick={handleSave}
            className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
          >
            <p className="font-medium text-md">
              {formatMessage({ id: "action.save" })}
            </p>
          </Button>
        </div>
      </div>
      <div className="px-4">
        <p className="text-sm font-bold">
          {formatMessage({ id: "config.agentUrl.label" })}
        </p>
        <input
          type="text"
          id="agent_url"
          className={`border text-black text-sm rounded-lg block w-full p-2.5 ${
            agentUrlError ? " text-red border-red" : ""
          } `}
          placeholder={formatMessage({ id: "config.agentUrl.placeholder" })}
          required
          value={agentUrl}
          onChange={(e) => setAgentUrl(e.target.value)}
          onBlur={() => handleSetAgentUrl(agentUrl)}
        />
        {agentUrlError ? <p className="text-red">{agentUrlError}</p> : null}
      </div>
      <div className="px-4">
        <p className="text-sm font-bold">
          {formatMessage({ id: "config.language.label" })}
        </p>
        <Dropdown
          selectedOption={langMap.find((s) => s.value === currentLocale)}
          options={langMap}
          onSelect={(option) => changeLocale(option.value)}
        />
      </div>
    </>
  );
}
