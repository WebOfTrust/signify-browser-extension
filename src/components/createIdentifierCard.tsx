import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { Button, Input, Box, Flex, NewButton } from "@components/ui";
import { hasWhiteSpace, removeWhiteSpace } from "@pages/background/utils";

interface ICreateIdentifierCard {
  error?: string | JSX.Element;
  handleCreateIdentifier: (name: string) => void;
  isLoading?: boolean;
}

export function CreateIdentifierCard(
  props: ICreateIdentifierCard
): JSX.Element {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | JSX.Element | undefined>(
    ""
  );
  const { formatMessage } = useIntl();
  const emptyNameError = formatMessage({ id: "identifier.error.emptyName" });

  useEffect(() => {
    setNameError(props.error);
  }, [props.error]);

  const handleRemoveWhiteSpace = () => {
    setName(removeWhiteSpace(name));
    setNameError("");
  };
  const onCreateIdentifier = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    let hasError = false;
    if (!name) {
      setNameError(emptyNameError);
      hasError = true;
    } else if (hasWhiteSpace(name)) {
      setNameError(
        <Box fontSize={0} marginTop={1} color="red">
          {formatMessage({ id: "identifier.error.noWhiteSpace" })}{" "}
          <NewButton
            $cursorPointer
            $underline
            type="button"
            onClick={handleRemoveWhiteSpace}
          >
            {formatMessage({ id: "action.clickToRemove" })}
          </NewButton>
        </Box>
      );
      hasError = true;
    }

    if (!hasError) {
      setNameError("");
      props.handleCreateIdentifier(name);
    }
  };

  return (
    <>
      <form onSubmit={onCreateIdentifier}>
        <Flex maxWidth="320px" $flexGap={4} flexDirection="column" margin={3}>
          <div>
            <Input
              type="text"
              id="vendor_url"
              error={nameError}
              placeholder={formatMessage({ id: "identifier.uniqueName" })}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Flex flexDirection="row" justifyContent="center" marginTop={2}>
            <Button
              type="submit"
              handleClick={onCreateIdentifier}
              isLoading={props.isLoading}
            >
              <p>{formatMessage({ id: "action.create" })}</p>
            </Button>
          </Flex>
        </Flex>
      </form>
    </>
  );
}
