import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { CredentialCard } from "@components/credentialCard";
import { Loader } from "@components/ui";
import { IMessage } from "@config/types";

export function CredentialList(): JSX.Element {
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
          <CredentialCard credential={credential} />
        </div>
      ))}
      {!isLoading && !credentials?.length ? (
        <p className="text-xs">{formatMessage({ id: "message.noItems" })}</p>
      ) : (
        <></>
      )}
    </>
  );
}
