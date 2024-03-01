import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { TAB_STATE } from "@pages/popup/constants";
import { SigninCard } from "@components/signinCard";
import { Loader } from "@components/ui";
import { IMessage, ISignin } from "@config/types";

interface IResourceSignin {
  index: number;
  signin?: ISignin;
}

export function SigninList(): JSX.Element {
  const [signins, setSignins] = useState<ISignin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatMessage } = useIntl();
  const fetchSignins = async () => {
    setIsLoading(true);
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "signins",
    });
    setSignins(data?.signins);
    setIsLoading(false);
  };

  const deleteSignin = async (index: number) => {
    const { data } = await chrome.runtime.sendMessage<
      IMessage<IResourceSignin>
    >({
      type: "delete-resource",
      subtype: "signins",
      data: {
        index,
      },
    });
    if (data?.isDeleted) {
      setSignins(data?.signins);
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: "tab",
          subtype: "reload-state",
          eventType: TAB_STATE.SELECT_IDENTIFIER,
        });
      });
    }
  };

  const updateAutoSignin = async (index: number, signin: ISignin) => {
    console.log("signin", signin, index);
    const { data } = await chrome.runtime.sendMessage<
      IMessage<IResourceSignin>
    >({
      type: "update-resource",
      subtype: "auto-signin",
      data: {
        index,
        signin,
      },
    });
    if (data?.signins) {
      setSignins(data?.signins);
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: "tab",
          subtype: "reload-state",
          eventType: TAB_STATE.SELECT_IDENTIFIER,
        });
      });
    }
  };

  useEffect(() => {
    fetchSignins();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex flex-row justify-center items-center">
          <Loader size={6} />
        </div>
      ) : null}
      {signins.map((signin, index) => (
        <div key={index} className="my-2 mx-4">
          <SigninCard
            signin={signin}
            handleDelete={() => deleteSignin(index)}
            handleAutoSignin={() => updateAutoSignin(index, signin)}
          />
        </div>
      ))}
      {!isLoading && !signins?.length ? (
        <p className="text-xs">{formatMessage({ id: "message.noItems" })}</p>
      ) : (
        <></>
      )}
    </>
  );
}
