import { obfuscateString } from "@pages/background/utils";
import { useIntl } from "react-intl";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Card, Text, Subtext, Flex, IconButton } from "@components/ui";
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
        <Flex flexDirection="row" justifyContent="space-between" fontSize={0}>
          <div>
            <Text fontWeight="bold" $color="heading">
              {formatMessage({ id: "identifier.alias.label" })}{" "}
              <Subtext fontWeight="normal" $color="text">
                {aid.name}
              </Subtext>
            </Text>
          </div>
          <IdentifierIcon size={6} />
        </Flex>
        <div>
          <Text fontWeight="bold" fontSize={0} $color="heading">
            {formatMessage({ id: "identifier.aid.label" })}{" "}
            <span data-tooltip-id={aid.prefix}>
              <Subtext
                fontWeight="normal"
                maxWidth="200px"
                $breakWord
                $cursorPointer
                $color="text"
              >
                {obfuscateString(aid.prefix)}
              </Subtext>
            </span>
          </Text>
        </div>
        <ReactTooltip id={aid.prefix} clickable delayShow={500}>
          <Flex flexDirection="row" fontSize={0} $flexGap={1}>
            <Text $color="">{aid.prefix}</Text>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(aid.prefix);
              }}
            >
              <CopyIcon size={3} />
            </IconButton>
          </Flex>
        </ReactTooltip>

        {/*  COMMENTED OUT FOR THE DEMO 
        <Flex flexDirection="row" justifyContent="space-between">
          <div>
            <Text fontWeight="bold" $color="heading">
              Credentials Received:{" "}
            </Text>
            <Text $color="text">13</Text>
          </div>
          <div>
            <Text fontWeight="bold" $color="heading">
              Last Used:{" "}
            </Text>
            <Text $color="text">November 08, 2023</Text>
          </div>
        </Flex> */}
      </>
    </Card>
  );
}
