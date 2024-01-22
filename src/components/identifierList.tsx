import { useState, useEffect } from "react";
import { IdentifierCard } from "@components/identifierCard";
import { Drawer } from "@components/drawer";
import { Loader } from "@components/loader";
import { IMessage } from "@pages/background/types";
import { CreateIdentifierCard } from "@components/createIdentifierCard";

export function IdentifierList(): JSX.Element {
  const [aids, setAids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [errCreate, setErrCreate] = useState("");

  const fetchIdentifiers = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "identifiers",
    });
    setAids(data.aids);
  };

  const initialFetchIdentifiers = async () => {
    setIsLoading(true);
    fetchIdentifiers();
    setIsLoading(false);
  };

  const refetchIdentifiers = async () => {
    await fetchIdentifiers();
    setShowDrawer(false);
  };

  useEffect(() => {
    initialFetchIdentifiers();
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
      await refetchIdentifiers();
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
        <button
          type="button"
          onClick={() => setShowDrawer(true)}
          className="text-white bg-green font-medium rounded-full text-xs px-2 py-1 text-center"
        >
          {"+ Create New"}
        </button>
      </div>
      <Drawer
        isOpen={showDrawer}
        handleClose={() => setShowDrawer(false)}
        header="Create Identifier"
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
        <p className="">No items to show</p>
      ) : (
        <></>
      )}
    </>
  );
}
