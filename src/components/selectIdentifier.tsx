import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { IdentifierCard } from "@components/identifierCard";
import { Button, Drawer } from "@components/ui";
import { Loader } from "@components/loader";
import { IMessage } from "@pages/background/types";
import { CreateIdentifierCard } from "@components/createIdentifierCard";

export function SelectIdentifier(): JSX.Element {
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
    console.log("data", data);
    setAids(data.aids);
  };

  const createSigninWithIdentifiers = async (aid: any) => {
    await chrome.runtime.sendMessage<IMessage<any>>({
      type: "create-resource",
      subtype: "signin",
      data: {
        identifier: aid,
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
    fetchIdentifiers();
  }, []);

  const handleCreateIdentifier = async (name) => {
    setIsCreating(true);
    const { data, error } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "create-resource",
      subtype: "identifier",
      data: { name },
    });
    if (error) {
      setErrCreate(error?.message);
    } else {
      if (data.done) {
        const prefix = data?.name?.split(".")?.[1];
        await createSigninWithIdentifiers({ prefix, name });
      }
      setErrCreate("");
    }
    setIsCreating(false);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex flex-row justify-center items-center">
          <Loader size={6} />
        </div>
      ) : null}
      <div className=" flex flex-row-reverse">
        <Button
          handleClick={() => setShowDrawer(true)}
          className=" text-white font-medium rounded-full text-xs px-2 py-1"
        >
          <>{`+ ${formatMessage({ id: "action.createNew" })}`}</>
        </Button>
      </div>
      <Drawer
        isOpen={showDrawer}
        handleClose={() => setShowDrawer(false)}
        header={formatMessage({ id: "identifier.create.title" })}
      >
        <CreateIdentifierCard
          isLoading={isCreating}
          handleCreateIdentifier={handleCreateIdentifier}
          error={errCreate}
        />
      </Drawer>
      {aids.map((aid, index) => (
        <div key={index} className="my-2 mx-4">
          <div className=" relative opacity-80 hover:opacity-100">
            <IdentifierCard aid={aid} />
            <Button
              handleClick={() => createSigninWithIdentifiers(aid)}
              className=" absolute right-0 bottom-0 text-white font-medium rounded-full text-xs px-2 py-1"
            >
              <>{`${formatMessage({ id: "action.select" })} >`}</>
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}
