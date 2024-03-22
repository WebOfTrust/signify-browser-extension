import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { CredentialCard } from "@components/credentialCard";
import { Loader, Flex, Box, Text } from "@components/ui";
import { IMessage } from "@config/types";

export function CredentialList(): JSX.Element {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatMessage } = useIntl();
  const fetchCredentials = async () => {
    setIsLoading(true);
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "credentials",
    });
    setCredentials(data.credentials);
    setIsLoading(false);
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
        <Text fontSize={0} $color="">
          {formatMessage({ id: "message.noItems" })}
        </Text>
      ) : (
        <></>
      )}
    </>
  );
}
