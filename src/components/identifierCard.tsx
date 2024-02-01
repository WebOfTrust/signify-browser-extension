import { obfuscateString } from "@pages/background/utils";
import { useIntl } from "react-intl";
import { Card, Text, Subtext } from "@components/ui";

interface IIdentifier {}

export function IdentifierCard({ aid }): JSX.Element {
  const { formatMessage } = useIntl();

  return (
    <Card>
      <>
        <div className="flex flex-row justify-between">
          <div>
            <Text className="font-bold" $color="heading">
              {formatMessage({ id: "identifier.alias.label" })}{" "}
              <Subtext className="font-normal max-w" $color="text">
                {aid.name}
              </Subtext>
            </Text>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
            />
          </svg>
        </div>
        <div className="">
          <Text className="font-bold" $color="heading">
            {formatMessage({ id: "identifier.aid.label" })}{" "}
            <Subtext
              className="font-normal max-w-[200px] break-words"
              $color="text"
            >
              {obfuscateString(aid.prefix)}
            </Subtext>
          </Text>
        </div>

        {/* COMMENTED OUT FOR THE DEMO
      <div className="flex flex-row justify-between">
        <div className="">
          <Text className="font-bold" $color="heading">Credentials Received: </Text>
          <Text className="font-normal" $color="text">13</Text>
        </div>
        <div className="">
          <Text className="font-bold" $color="heading">Last Used: </Text>
          <Text className="font-normal" $color="text">November 08, 2023</Text>
        </div>
      </div> */}
      </>
    </Card>
  );
}
