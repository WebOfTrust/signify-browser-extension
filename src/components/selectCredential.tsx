import { useState, useEffect } from "react";
import { CustomRadio } from "@components/customRadio";
import { CredentialCard } from "@components/credentialCard";
import { IMessage } from "@pages/background/types";
import { APP_STATE } from "@pages/popup/constants";

export function SelectCredential(): JSX.Element {
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);

  const fetchCredentials = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "credentials",
    });
    setCredentials(data.credentials);
  };

  const createSigninWithCredential = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "create-resource",
      subtype: "signin",
      data: {
        credential: selectedCredential,
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
          <CustomRadio
            id={credential?.schema?.title}
            checked={
              selectedCredential?.schema?.title === credential?.schema?.title
            }
            onClick={() => setSelectedCredential(credential)}
            component={<CredentialCard credential={credential} />}
          />
        </div>
      ))}
      <button
        disabled={!selectedCredential}
        onClick={createSigninWithCredential}
        className={`fixed bottom-0 right-4 text-white ${
          selectedCredential ? "bg-green" : " bg-gray"
        } focus:outline-none font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2`}
      >
        Select
      </button>
    </>
  );
}
