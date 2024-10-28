import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { Tooltip as ReactTooltip } from "react-tooltip";
import toast from "react-hot-toast";
import { UI_EVENTS } from "@config/event-types";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { sendMessageTab, getCurrentTab } from "@src/shared/browser/tabs-utils";
import { CredentialCard } from "@components/credentialCard";
import { Button, Loader, Text, Flex, Box } from "@components/ui";
import { ICredential } from "@config/types";

export function SelectCredential(): JSX.Element {
  const [credentials, setCredentials] = useState<ICredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatMessage } = useIntl();
  const fetchCredentials = async () => {
    setIsLoading(true);
    const { data, error } = await sendMessage({
      type: UI_EVENTS.fetch_resource_credentials,
    });
    setIsLoading(false);
    if (error) {
      toast.error(error?.message);
    } else {
      const _credentials = data?.credentials?.filter(_cred => _cred.issueeName) ?? [];
      setCredentials(_credentials);
    }
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
              {credential?.issueeName ? (
                <Button
                  handleClick={() => createSigninWithCredential(credential)}
                  disabled={!credential?.issueeName}
                >
                  <>{`${formatMessage({ id: "action.select" })} >`}</>
                </Button>
              ) : (
                <>
                  <span data-tooltip-id={credential?.sad?.d}>
                    <Button
                      handleClick={() => createSigninWithCredential(credential)}
                      disabled={!credential?.issueeName}
                    >
                      <>{`${formatMessage({ id: "action.select" })} >`}</>
                    </Button>
                  </span>
                  <ReactTooltip id={credential?.sad?.d} delayShow={200}>
                    <Flex flexDirection="row" fontSize={0} $flexGap={1}>
                      <Text $color="">{formatMessage({ id: "credential.unidentifiedIssuee" })}</Text>
                    </Flex>
                  </ReactTooltip>
                </>
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </>
  );
}
