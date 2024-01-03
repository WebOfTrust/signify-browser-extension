import { useState, useEffect } from "react";
import { IdentifierCard } from "@components/identifierCard";
import { IMessage } from "@pages/background/types";

export function IdentifierList(): JSX.Element {
  const [aids, setAids] = useState([]);
  const fetchIdentifiers = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "identifiers",
    });
    console.log("data", data);
    setAids(data.aids);
  };

  useEffect(() => {
    fetchIdentifiers();
  }, []);

  return (
    <>
      {aids.map((aid, index) => (
        <div key={index} className="my-2">
          <IdentifierCard aid={aid} />
        </div>
      ))}
    </>
  );
}
