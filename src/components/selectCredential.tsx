import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { UI_EVENTS } from "@config/event-types";
import { sendMessage } from "@shared/runtime-utils";
import { sendMessageTab, getCurrentTab } from "@shared/tabs-utils";
import { CredentialCard } from "@components/credentialCard";
import { Button, Loader, Flex, Box } from "@components/ui";
import { ICredential } from "@config/types";

export function SelectCredential(): JSX.Element {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatMessage } = useIntl();
  const fetchCredentials = async () => {
    setIsLoading(true);
    const { data } = await sendMessage({
      type: UI_EVENTS.fetch_resource_credentials,
    });
    setCredentials(data.credentials);
    setIsLoading(false);
  };

  const createSigninWithCredential = async (credential: ICredential) => {
    await sendMessage<{ credential: ICredential }>({
      type: UI_EVENTS.create_resource_signin,
      data: {
        credential,
      },
    });
    const tab = await getCurrentTab();
    const { data } = await sendMessageTab(tab.id!, {
      type: "tab",
      subtype: "get-tab-state",
    });
    await sendMessageTab(tab.id!, {
      type: "tab",
      subtype: "reload-state",
      eventType: data?.tabState,
    });

    window.close();
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  return (
    <>
      {isLoading ? (
        <Flex flexDirection="row" justifyContent="center" alignItems="center">
          <Loader size={6} />
        </Flex>
      ) : null}
      {credentials.map((credential, index) => (
        <Box marginY={2} marginX={3} key={index}>
          <Box position="relative" $hoverableOpacity>
            <CredentialCard credential={credential} />
            <Box position="absolute" right="2px" bottom="2px">
              <Button
                handleClick={() => createSigninWithCredential(credential)}
              >
                <>{`${formatMessage({ id: "action.select" })} >`}</>
              </Button>
            </Box>
          </Box>
        </Box>
      ))}
    </>
  );
}
