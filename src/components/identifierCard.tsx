import { obfuscateString } from "@pages/background/utils";
import { useIntl } from "react-intl";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Card, Text, Subtext } from "@components/ui";
import IdentifierIcon from "@components/shared/icons/identifier";
import CopyIcon from "@components/shared/icons/copy";
import { IIdentifier } from "@config/types";

interface IIdentifierCard {
  aid: IIdentifier;
}

export function IdentifierCard({ aid }: IIdentifierCard): JSX.Element {
  const { formatMessage } = useIntl();

  return (
    <Card>
      <>
        <div className="flex flex-row justify-between text-xs">
          <div>
            <Text className="font-bold" $color="heading">
              {formatMessage({ id: "identifier.alias.label" })}{" "}
              <Subtext className="font-normal max-w" $color="text">
                {aid.name}
              </Subtext>
            </Text>
          </div>
          <IdentifierIcon size={6} />
        </div>
        <div>
          <Text className="font-bold text-xs" $color="heading">
            {formatMessage({ id: "identifier.aid.label" })}{" "}
            <span data-tooltip-id={aid.prefix}>
              <Subtext
                className="cursor-pointer font-normal max-w-[200px] break-words"
                $color="text"
              >
                {obfuscateString(aid.prefix)}
              </Subtext>
            </span>
          </Text>
        </div>
        <ReactTooltip id={aid.prefix} clickable delayShow={500}>
          <div className="flex flex-row gap-x-1 text-xs">
            <p>{aid.prefix}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(aid.prefix);
              }}
            >
              <CopyIcon size={3} />
            </button>
          </div>
        </ReactTooltip>
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
