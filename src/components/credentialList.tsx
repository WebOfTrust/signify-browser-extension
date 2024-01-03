import { useState, useEffect } from "react";
import { CredentialCard } from "@components/credentialCard";
import { IMessage } from "@pages/background/types";

export function CredentialList(): JSX.Element {
  const [credentials, setCredentials] = useState([]);
  const fetchCredentials = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "credentials",
    });
    console.log("credentials", data);
    setCredentials(data.credentials);
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  return (
    <>
      {credentials.map((credential, index) => (
        <div key={index} className="my-2 mx-4">
          <CredentialCard credential={credential} />
        </div>
      ))}
    </>
  );
}
