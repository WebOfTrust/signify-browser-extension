import { isValidElement, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { Button } from "@components/ui";
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
  const onCreateIdentifier = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    let hasError = false;
    if (!name) {
      setNameError(emptyNameError);
      hasError = true;
    } else if (hasWhiteSpace(name)) {
      setNameError(
        <div className="text-red mt-1">
          {formatMessage({ id: "identifier.error.noWhiteSpace" })}{" "}
          <button
            className=" underline cursor-pointer"
            type="button"
            onClick={handleRemoveWhiteSpace}
          >
            {formatMessage({ id: "action.clickToRemove" })}
          </button>
        </div>
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
      <form
        onSubmit={onCreateIdentifier}
        className=" max-w-xs m-4 flex flex-col gap-y-4"
      >
        <div>
          <input
            type="text"
            id="vendor_url"
            className={`border text-black text-sm rounded-lg block w-full p-2.5 ${
              nameError ? " text-red border-red" : ""
            } `}
            placeholder={formatMessage({ id: "identifier.uniqueName" })}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameError ? (
            isValidElement(nameError) ? (
              nameError
            ) : (
              <p className="text-red mt-1">{nameError}</p>
            )
          ) : null}
        </div>
        <div className=" flex flex-row justify-center mt-2">
          <Button
            type="submit"
            // handleClick={onCreateIdentifier}
            isLoading={props.isLoading}
            className="text-white flex flex-row font-medium rounded-full text-sm px-5 py-2"
          >
            <p className="font-medium text-md">
              {formatMessage({ id: "action.create" })}
            </p>
          </Button>
        </div>
      </form>
    </>
  );
}
