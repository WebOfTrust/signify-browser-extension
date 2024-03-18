import { useState } from "react";
import { useIntl } from "react-intl";
import { Card, Button, Text } from "@components/ui";
import { IMessage } from "@config/types";

interface ISignup {
  handleBootAndConnect: (passcode: string) => void;
  isLoading: boolean;
}

export function Signup({
  handleBootAndConnect,
  isLoading,
}: ISignup): JSX.Element {
  const [generatedPasscode, setGeneratedPasscode] = useState("");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const { formatMessage } = useIntl();

  const handleGeneratePasscode = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "authentication",
      subtype: "generate-passcode",
    });
    if (data?.passcode) {
      setGeneratedPasscode(data.passcode);
    }
  };

  return (
    <div className="p-4 relative">
      <div className="mb-2">
        <p className="text-sm font-bold">
          {generatedPasscode
            ? formatMessage({
                id: "signup.title.saveYourPasscode",
              })
            : formatMessage({
                id: "signup.title.generatePasscode",
              })}
        </p>
      </div>
      <div className="mb-2">
        <p className="text-xs font-bold">
          {formatMessage({
            id: "signup.desc.safegaurd",
          })}
        </p>
        <p className="text-xs font-bold">
          {formatMessage({
            id: "signup.desc.storeYourPasscode",
          })}
        </p>
      </div>
      <Card>
        <>
          <div className=" mb-2">
            <Text className="font-bold text-xs break-words" $color="heading">
              {formatMessage({ id: "signup.warning.cannotRetrieve" })}
            </Text>
          </div>

          {generatedPasscode ? (
            <Card>
              <div className="flex flex-row gap-x-1 justify-between text-xs">
                <p>{generatedPasscode}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPasscode);
                  }}
                >
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                  >
                    <path
                      fill="currentColor"
                      fill-rule="evenodd"
                      d="M4 2a2 2 0 00-2 2v9a2 2 0 002 2h2v2a2 2 0 002 2h9a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H4zm9 4V4H4v9h2V8a2 2 0 012-2h5zM8 8h9v9H8V8z"
                    />
                  </svg>
                </button>
              </div>
            </Card>
          ) : (
            <></>
          )}
          <div className="flex flex-row justify-between mt-2">
            {generatedPasscode ? (
              copiedToClipboard ? (
                <Button
                  isLoading={isLoading}
                  handleClick={() => handleBootAndConnect(generatedPasscode)}
                  className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
                >
                  <p className="font-medium text-md">
                    {formatMessage({ id: "action.connect" })}
                  </p>
                </Button>
              ) : (
                <Button
                  handleClick={() => setCopiedToClipboard(true)}
                  className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
                >
                  <p className="font-medium text-md">
                    {formatMessage({
                      id: "signup.action.copyToClipboard",
                    })}
                  </p>
                </Button>
              )
            ) : (
              <Button
                handleClick={handleGeneratePasscode}
                className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
              >
                <p className="font-medium text-md">
                  {formatMessage({ id: "signup.title.generatePasscode" })}
                </p>
              </Button>
            )}
          </div>
        </>
      </Card>
    </div>
  );
}
