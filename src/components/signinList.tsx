import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { SigninCard } from "@components/signinCard";
import { Loader, Flex, Box, Text } from "@components/ui";
import { IMessage, ISignin } from "@config/types";

interface IDeleteSignin {
  id: string;
}

interface IUpdateSignin {
  signin: ISignin;
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

  const deleteSignin = async (id: string) => {
    const { data } = await chrome.runtime.sendMessage<
      IMessage<IDeleteSignin>
    >({
      type: "delete-resource",
      subtype: "signins",
      data: {
        id,
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

  const updateAutoSignin = async (signin: ISignin) => {
    const { data } = await chrome.runtime.sendMessage<
      IMessage<IUpdateSignin>
    >({
      type: "update-resource",
      subtype: "auto-signin",
      data: {
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
      {signins.map((signin) => (
        <Box marginY={2} marginX={3} key={signin.id}>
          <SigninCard
            signin={signin}
            handleDelete={() => deleteSignin(signin.id)}
            handleAutoSignin={() => updateAutoSignin(signin)}
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
