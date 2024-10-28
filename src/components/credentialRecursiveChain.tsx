import { useIntl } from "react-intl";
import { ICredential } from "@config/types";
import Collapsible from "react-collapsible";
import { Flex, Box, IconButton } from "@components/ui";
import OpenFile from "@components/shared/icons/open-file";

interface ITriggerItem {
  title: string;
  onClickTrigger?: (idx: string) => void;
  idx: string;
}

function TriggerItem({ title, onClickTrigger, idx }: ITriggerItem) {
  return (
    <Flex $cursorPointer $flexGap={1}>
      {title}{" "}
      <IconButton
        onClick={(e) => {
          if (onClickTrigger) {
            onClickTrigger(idx);
          }
          e?.stopPropagation();
        }}
      >
        <OpenFile size={3} />
      </IconButton>
    </Flex>
  );
}

export function CredentialRecursiveChain({
  credential,
  openMessage,
  closeMessage,
  idx,
  exploreChain,
}: {
  credential: ICredential;
  openMessage?: string | React.ReactElement;
  closeMessage?: string | React.ReactElement;
  idx: string;
  exploreChain?: (id: string) => void;
}): JSX.Element {
  const { formatMessage } = useIntl();

  if (credential?.chains?.length === 0)
    return (
      <TriggerItem
        idx={idx}
        title={credential?.schema?.title}
        onClickTrigger={exploreChain}
      />
    );

  return (
    <Collapsible
      trigger={
        openMessage ?? (
          <TriggerItem
            idx={idx}
            title={credential?.schema?.title}
            onClickTrigger={exploreChain}
          />
        )
      }
      triggerWhenOpen={
        closeMessage ?? (
          <TriggerItem
            idx={idx}
            title={credential?.schema?.title}
            onClickTrigger={exploreChain}
          />
        )
      }
    >
      {credential?.chains?.map((chain, index) => (
        <>
          <Box marginY={2} marginX={3} key={index}>
            <CredentialRecursiveChain
              credential={chain}
              idx={`${idx}.${index}`}
              exploreChain={exploreChain}
            />
          </Box>
        </>
      ))}
    </Collapsible>
  );
}
