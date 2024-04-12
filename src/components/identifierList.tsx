import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { UI_EVENTS } from "@config/event-types";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { IdentifierCard } from "@components/identifierCard";
import { Button, Box, Drawer, Flex, Text, Loader } from "@components/ui";
import { CreateIdentifierCard } from "@components/createIdentifierCard";

interface ICreateIdentifier {
  name: string;
}

export function IdentifierList(): JSX.Element {
  const [aids, setAids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [errCreate, setErrCreate] = useState("");
  const { formatMessage } = useIntl();

  const fetchIdentifiers = async () => {
    const { data } = await sendMessage({
      type: UI_EVENTS.fetch_resource_identifiers,
    });
    setAids(data.aids);
  };

  const initialFetchIdentifiers = async () => {
    setIsLoading(true);
    await fetchIdentifiers();
    setIsLoading(false);
  };

  const refetchIdentifiers = async () => {
    await fetchIdentifiers();
    setShowDrawer(false);
  };

  useEffect(() => {
    initialFetchIdentifiers();
  }, []);

  const handleCreateIdentifier = async (name: string) => {
    setIsCreating(true);
    const { data, error } = await sendMessage<ICreateIdentifier>({
      type: UI_EVENTS.create_resource_identifier,
      data: { name },
    });
    if (error) {
      setErrCreate(error?.message);
    } else {
      await refetchIdentifiers();
      setErrCreate("");
    }
    setIsCreating(false);
  };

  return (
    <>
      <Flex flexDirection="row-reverse">
        <Button handleClick={() => setShowDrawer(true)}>
          <>{`+ ${formatMessage({ id: "action.createNew" })}`}</>
        </Button>
      </Flex>
      {isLoading ? (
        <Flex flexDirection="row" justifyContent="center" alignItems="center">
          <Loader size={6} />
        </Flex>
      ) : null}
      <Drawer
        isOpen={showDrawer}
        handleClose={() => setShowDrawer(false)}
        header={
          <Text fontWeight="bold" $color="subtext" fontSize={3} $capitalize>
            {formatMessage({ id: "identifier.create.title" })}
          </Text>
        }
      >
        <CreateIdentifierCard
          isLoading={isCreating}
          handleCreateIdentifier={handleCreateIdentifier}
          error={errCreate}
        />
      </Drawer>
      {aids.map((aid, index) => (
        <Box marginX={3} marginY={2} key={index}>
          <IdentifierCard aid={aid} />
        </Box>
      ))}
      {!isLoading && !aids?.length ? (
        <Text fontSize={0} $color="subtext">
          {formatMessage({ id: "message.noItems" })}
        </Text>
      ) : (
        <></>
      )}
    </>
  );
}
