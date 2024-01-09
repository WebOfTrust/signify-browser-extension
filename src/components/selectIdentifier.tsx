import { useState, useEffect } from "react";
import { CustomRadio } from "@components/customRadio";
import { IdentifierCard } from "@components/identifierCard";
import { IMessage } from "@pages/background/types";
import { APP_STATE } from "@pages/popup/constants";

export function SelectIdentifier(): JSX.Element {
  const [aids, setAids] = useState([]);
  const [selectedAid, setSelectedAid] = useState(null);

  const fetchIdentifiers = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "identifiers",
    });
    console.log("data", data);
    setAids(data.aids);
  };

  const createSigninWithIdentifiers = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "create-resource",
      subtype: "signin",
      data: {
        identifier: selectedAid,
      },
    });
    await chrome.runtime.sendMessage({
      type: "tab",
      subtype: "set-tab-state",
      data: {
        appState: APP_STATE.DEFAULT,
      },
    });
    console.log("data.signins", data.signins);
    window.close();
  };

  useEffect(() => {
    fetchIdentifiers();
  }, []);

  return (
    <>
      {aids.map((aid, index) => (
        <div key={index} className="my-2 mx-4">
          <CustomRadio
            id={aid.name}
            checked={selectedAid?.prefix === aid?.prefix}
            onClick={() => setSelectedAid(aid)}
            component={<IdentifierCard aid={aid} />}
          />
        </div>
      ))}
      <button
        disabled={!selectedAid}
        onClick={createSigninWithIdentifiers}
        className={`fixed bottom-0 right-4 text-white ${
          selectedAid ? "bg-green" : " bg-gray"
        } focus:outline-none font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2`}
      >
        Select
      </button>
    </>
  );
}
