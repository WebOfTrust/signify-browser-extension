import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import toast from "react-hot-toast";
import { UI_EVENTS } from "@config/event-types";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { CredentialCard } from "@components/credentialCard";
import { Loader, Flex, Box, Text } from "@components/ui";

export function CredentialList(): JSX.Element {
  const [credentials, setCredentials] = useState([]);
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
      setCredentials(data.credentials);
    }
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
          <CredentialCard credential={credential} />
        </Box>
      ))}
      {!isLoading && !credentials?.length ? (
        <Text fontSize={0} $color="subtext">
          {formatMessage({ id: "message.noItems" })}
        </Text>
      ) : (
        <></>
      )}
    </>
  );
}
