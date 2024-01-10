import { useState, useEffect } from "react";
import { CredentialCard } from "@components/credentialCard";
import { IMessage } from "@pages/background/types";
import { APP_STATE } from "@pages/popup/constants";

export function SelectCredential(): JSX.Element {
  const [credentials, setCredentials] = useState([]);
  const fetchCredentials = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "credentials",
    });
    setCredentials(data.credentials);
  };

  const createSigninWithCredential = async (credential) => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "create-resource",
      subtype: "signin",
      data: {
        credential,
      },
    });
    await chrome.runtime.sendMessage({
      type: "tab",
      subtype: "set-app-state",
      data: {
        appState: APP_STATE.DEFAULT,
      },
    });
    window.close();
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  return (
    <>
      {credentials.map((credential, index) => (
        <div key={index} className="my-2 mx-4">
          <div className=" relative opacity-80 hover:opacity-100">
            <CredentialCard credential={credential} />
            <button
              type="button"
              onClick={() => createSigninWithCredential(credential)}
              className=" absolute right-0 bottom-0 text-white bg-green font-medium rounded-full text-xs px-2 py-1 text-center me-2 mb-2"
            >
              {"Select >"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
