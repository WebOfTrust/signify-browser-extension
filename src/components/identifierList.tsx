import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { IdentifierCard } from "@components/identifierCard";
import { Button, Drawer, Text, Loader } from "@components/ui";
import { IMessage } from "@pages/background/types";
import { CreateIdentifierCard } from "@components/createIdentifierCard";

interface ICreateIdentifier {
  name: string;
}

export function IdentifierList(): JSX.Element {
  const [aids, setAids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [errCreate, setErrCreate] = useState("");
  const { formatMessage } = useIntl();

  const fetchIdentifiers = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "identifiers",
    });
    setAids(data.aids);
  };

  const initialFetchIdentifiers = async () => {
    setIsLoading(true);
    await fetchIdentifiers();
    setIsLoading(false);
  };

  const refetchIdentifiers = async () => {
    await fetchIdentifiers();
    setShowDrawer(false);
  };

  useEffect(() => {
    initialFetchIdentifiers();
  }, []);

  const handleCreateIdentifier = async (name: string) => {
    setIsCreating(true);
    const { data, error } = await chrome.runtime.sendMessage<
      IMessage<ICreateIdentifier>
    >({
      type: "create-resource",
      subtype: "identifier",
      data: { name },
    });
    if (error) {
      setErrCreate(error?.message);
    } else {
      await refetchIdentifiers();
      setErrCreate("");
    }
    setIsCreating(false);
  };

  return (
    <>
      <div className=" flex flex-row-reverse">
        <Button
          handleClick={() => setShowDrawer(true)}
          className="text-white font-medium rounded-full text-xs px-2 py-1"
        >
          <>{`+ ${formatMessage({ id: "action.createNew" })}`}</>
        </Button>
      </div>
      {isLoading ? (
        <div className="flex flex-row justify-center items-center">
          <Loader size={6} />
        </div>
      ) : null}
      <Drawer
        isOpen={showDrawer}
        handleClose={() => setShowDrawer(false)}
        header={
          <Text $color="subtext" className="text-xl capitalize font-bold">
            {formatMessage({ id: "identifier.create.title" })}
          </Text>
        }
      >
        <CreateIdentifierCard
          isLoading={isCreating}
          handleCreateIdentifier={handleCreateIdentifier}
          error={errCreate}
        />
      </Drawer>
      {aids.map((aid, index) => (
        <div key={index} className="my-2 mx-4">
          <IdentifierCard aid={aid} />
        </div>
      ))}
      {!isLoading && !aids?.length ? (
        <p className="">{formatMessage({ id: "message.noItems" })}</p>
      ) : (
        <></>
      )}
    </>
  );
}
