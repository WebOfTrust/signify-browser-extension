import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { UI_EVENTS } from "@config/event-types";
import { CredentialCard } from "@components/credentialCard";
import { Button, Loader, Flex, Box } from "@components/ui";
import { IMessage } from "@config/types";

export function SelectCredential(): JSX.Element {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatMessage } = useIntl();
  const fetchCredentials = async () => {
    setIsLoading(true);
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: UI_EVENTS.fetch_resource_credentials
    });
    setCredentials(data.credentials);
    setIsLoading(false);
  };

  const createSigninWithCredential = async (credential: any) => {
    await chrome.runtime.sendMessage<IMessage<any>>({
      type: UI_EVENTS.create_resource_signin,
      data: {
        credential,
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
