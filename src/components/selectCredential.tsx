import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { CredentialCard } from "@components/credentialCard";
import { Button } from "@components/ui";
import { Loader } from "@components/loader";
import { IMessage } from "@pages/background/types";

export function SelectCredential(): JSX.Element {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatMessage } = useIntl();
  const fetchCredentials = async () => {
    setIsLoading(true);
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "credentials",
    });
    setCredentials(data.credentials);
    setIsLoading(false);
  };

  const createSigninWithCredential = async (credential: any) => {
    await chrome.runtime.sendMessage<IMessage<any>>({
      type: "create-resource",
      subtype: "signin",
      data: {
        credential,
      },
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id!, {
        type: "tab",
        subtype: "reload-state",
      });
    });
    window.close();
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex flex-row justify-center items-center">
          <Loader size={6} />
        </div>
      ) : null}
      {credentials.map((credential, index) => (
        <div key={index} className="my-2 mx-4">
          <div className=" relative opacity-80 hover:opacity-100">
            <CredentialCard credential={credential} />
            <Button
              handleClick={() => createSigninWithCredential(credential)}
              className="absolute right-0 bottom-0 text-white font-medium rounded-full text-xs px-2 py-1 "
            >
              <>{`${formatMessage({ id: "action.select" })} >`}</>
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}
