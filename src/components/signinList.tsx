import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { SigninCard } from "@components/signinCard";
import { Loader, Flex, Box, Text } from "@components/ui";
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
      chrome.tabs.query(
        { active: true, currentWindow: true },
        async function (tabs) {
          const { data } = await chrome.tabs.sendMessage(tabs[0].id!, {
            type: "tab",
            subtype: "get-tab-state",
          });
          chrome.tabs.sendMessage(tabs[0].id!, {
            type: "tab",
            subtype: "reload-state",
            eventType: data?.tabState,
          });
        }
      );
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
      chrome.tabs.query(
        { active: true, currentWindow: true },
        async function (tabs) {
          const { data } = await chrome.tabs.sendMessage(tabs[0].id!, {
            type: "tab",
            subtype: "get-tab-state",
          });
          chrome.tabs.sendMessage(tabs[0].id!, {
            type: "tab",
            subtype: "reload-state",
            eventType: data?.tabState,
          });
        }
      );
    }
  };

  useEffect(() => {
    fetchSignins();
  }, []);

  return (
    <>
      {isLoading ? (
        <Flex flexDirection="row" justifyContent="center" alignItems="center">
          <Loader size={6} />
        </Flex>
      ) : null}
      {signins.map((signin, index) => (
        <Box marginY={2} marginX={3} key={index}>
          <SigninCard
            signin={signin}
            handleDelete={() => deleteSignin(index)}
            handleAutoSignin={() => updateAutoSignin(index, signin)}
          />
        </Box>
      ))}
      {!isLoading && !signins?.length ? (
        <Text fontSize={0} $color="">
          {formatMessage({ id: "message.noItems" })}
        </Text>
      ) : (
        <></>
      )}
    </>
  );
}
