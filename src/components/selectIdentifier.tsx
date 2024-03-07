import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { IdentifierCard } from "@components/identifierCard";
import { Button, Drawer, Text, Loader } from "@components/ui";
import { IMessage } from "@config/types";
import { CreateIdentifierCard } from "@components/createIdentifierCard";

interface ISelectIdentifier {
  name: string;
}

export function SelectIdentifier(): JSX.Element {
  const [aids, setAids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [errCreate, setErrCreate] = useState("");
  const { formatMessage } = useIntl();

  const fetchIdentifiers = async () => {
    setIsLoading(true);
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "identifiers",
    });
    console.log("data", data);
    setIsLoading(false);
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

    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        const { data } = await chrome.tabs.sendMessage(tabs[0].id!, {
          type: "tab",
          subtype: "get-tab-state",
        });
        await chrome.tabs.sendMessage(tabs[0].id!, {
          type: "tab",
          subtype: "reload-state",
          eventType: data?.tabState,
        });

        window.close();
      }
    );
  };

  useEffect(() => {
    fetchIdentifiers();
  }, []);

  const handleCreateIdentifier = async (name: string) => {
    setIsCreating(true);
    const { data, error } = await chrome.runtime.sendMessage<
      IMessage<ISelectIdentifier>
    >({
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
      <div className=" flex flex-row-reverse">
        <Button
          handleClick={() => setShowDrawer(true)}
          className=" text-white font-medium rounded-full text-xs px-2 py-1"
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
          <div className=" relative opacity-80 hover:opacity-100">
            <IdentifierCard aid={aid} />
            <Button
              handleClick={() => createSigninWithIdentifiers(aid)}
              className=" absolute right-[2px] bottom-[2px] text-white font-medium rounded-full text-xs px-2 py-1"
            >
              <>{`${formatMessage({ id: "action.select" })} >`}</>
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}
