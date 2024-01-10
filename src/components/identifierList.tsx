import { useState, useEffect } from "react";
import { IdentifierCard } from "@components/identifierCard";
import { Loader } from "@components/loader";
import { IMessage } from "@pages/background/types";

export function IdentifierList(): JSX.Element {
  const [aids, setAids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchIdentifiers = async () => {
    setIsLoading(true);
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "identifiers",
    });
    console.log("data", data);
    setAids(data.aids);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchIdentifiers();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex flex-row justify-center items-center">
          <Loader size={6} />
        </div>
      ) : null}
      {aids.map((aid, index) => (
        <div key={index} className="my-2 mx-4">
          <IdentifierCard aid={aid} />
        </div>
      ))}
      {!isLoading && !aids?.length ? (
        <p className="">No items to show</p>
      ) : (
        <></>
      )}
    </>
  );
}
