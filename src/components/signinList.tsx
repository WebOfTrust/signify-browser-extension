import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { UI_EVENTS } from "@config/event-types";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { sendMessageTab, getCurrentTab } from "@src/shared/browser/tabs-utils";
import { SigninCard } from "@components/signinCard";
import { Loader, Flex, Box, Text } from "@components/ui";
import { ISignin } from "@config/types";

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
    const { data } = await sendMessage({
      type: UI_EVENTS.fetch_resource_signins,
    });
    setSignins(data?.signins);
    setIsLoading(false);
  };

  const deleteSignin = async (id: string) => {
    const { data } = await sendMessage<IDeleteSignin>({
      type: UI_EVENTS.delete_resource_signins,
      data: {
        id,
      },
    });
    if (data?.isDeleted) {
      setSignins(data?.signins);
      const tab = await getCurrentTab();
      const { data: tabData } = await sendMessageTab(tab.id!, {
        type: "tab",
        subtype: "get-tab-state",
      });
      sendMessageTab(tab.id!, {
        type: "tab",
        subtype: "reload-state",
        eventType: tabData?.tabState,
      });
    }
  };

  const updateAutoSignin = async (signin: ISignin) => {
    const { data } = await sendMessage<IUpdateSignin>({
      type: UI_EVENTS.update_resource_auto_signin,
      data: {
        signin,
      },
    });
    if (data?.signins) {
      setSignins(data?.signins);
      const tab = await getCurrentTab();
      const { data: tabData } = await sendMessageTab(tab.id!, {
        type: "tab",
        subtype: "get-tab-state",
      });
      sendMessageTab(tab.id!, {
        type: "tab",
        subtype: "reload-state",
        eventType: tabData?.tabState,
      });
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
