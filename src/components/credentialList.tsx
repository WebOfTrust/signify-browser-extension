import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import toast from "react-hot-toast";
import { UI_EVENTS } from "@config/event-types";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { CredentialCard } from "@components/credentialCard";
import { Loader, Flex, Box, Text, IconButton } from "@components/ui";
import BackArrow from "@components/shared/icons/back-arrow";

export function CredentialList(): JSX.Element {
  const [ogCredentials, setOGCredentials] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
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
      const _credentials =
        data?.credentials?.filter((_cred) => _cred.issueeName) ?? [];
      setCredentials(_credentials);
      setOGCredentials(_credentials);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const traverseCredentialChain = (id: string) => {
    const indices = id.split(".");
    const _breadcrumb = [];
    if (!indices?.length || indices?.length === 1) {
      setCredentials(ogCredentials);
      return;
    }

    const firstNode = credentials[indices[0]];
    let current = firstNode;
    _breadcrumb.push(current);

    indices.slice(1).forEach((indice) => {
      if (!current?.chains?.[indice]) return;
      current = current.chains[indice];
      _breadcrumb.push(current);
    });
    setCredentials([current]);
    setBreadcrumbs(_breadcrumb);
  };
  return (
    <>
      {isLoading ? (
        <Flex flexDirection="row" justifyContent="center" alignItems="center">
          <Loader size={6} />
        </Flex>
      ) : null}
      {breadcrumbs?.length ? (
        <Flex $flexGap={1}>
          <IconButton
            onClick={() => {
              setCredentials(ogCredentials);
              setBreadcrumbs([]);
            }}
          >
            <BackArrow size={5} />
          </IconButton>
          <Box>
            {breadcrumbs.map((bc, indx) => (
              <Text fontSize={0} $color="subtext">
                {bc?.schema?.title}{" "}
                {indx < breadcrumbs.length - 1 ? <strong>{" > "}</strong> : ""}
              </Text>
            ))}
          </Box>
        </Flex>
      ) : null}
      {credentials.map((credential, index) => (
        <Box marginY={2} marginX={3} key={index}>
          <CredentialCard
            credential={credential}
            showExplore={true}
            idx={index}
            exploreChain={traverseCredentialChain}
          />
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
