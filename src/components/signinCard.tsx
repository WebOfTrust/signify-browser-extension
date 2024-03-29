import { useIntl } from "react-intl";
import { Card, Button, Text, Switch, Flex } from "@components/ui";
import SigninIcon from "@components/shared/icons/signin";
import AutoSigninIcon from "@components/shared/icons/auto-signin";
import { ISignin } from "@config/types";

interface ISigninCard {
  signin: ISignin;
  handleDelete: () => void;
  handleAutoSignin: () => void;
}

export function SigninCard({
  signin,
  handleDelete,
  handleAutoSignin,
}: ISigninCard): JSX.Element {
  const { formatMessage } = useIntl();
  return (
    <Card>
      <>
        <Flex
          flexDirection="row"
          justifyContent="space-between"
          fontSize={0}
          marginBottom={1}
        >
          <div>
            <Text fontWeight="bold" $color="heading">
              {formatMessage({ id: "signin.website" })}
            </Text>
            <Text $color="text">{signin?.domain}</Text>
          </div>
          <SigninIcon size={6} />
        </Flex>

        <Flex
          flexDirection="row"
          justifyContent="space-between"
          fontSize={0}
          marginBottom={1}
        >
          <div>
            <Text fontWeight="bold" $color="heading">
              {signin?.identifier
                ? formatMessage({ id: "signin.identifierAlias" })
                : formatMessage({ id: "credential.title" })}
            </Text>
            <Text $color="text">{signin?.identifier?.name ?? signin?.credential?.schema?.title}</Text>
          </div>
          <div>
            <Text fontWeight="bold" $color="heading">
              {formatMessage({ id: "signin.lastUsed.label" })}
            </Text>
            <Text $color="text">
              {new Date(signin?.updatedAt).toDateString()}
            </Text>
          </div>
        </Flex>
        <Flex flexDirection="row" justifyContent="space-between" fontSize={0}>
          <div>
            <Text fontWeight="bold" $color="heading">
              {formatMessage({ id: "signin.autoSignin" })}
            </Text>
            <Switch
              isChecked={!!signin.autoSignin}
              handleToggle={handleAutoSignin}
              icon={<AutoSigninIcon size={4} />}
            />
          </div>
          <Flex alignItems="end">
            <Button handleClick={handleDelete}>
              <>{formatMessage({ id: "action.delete" })}</>
            </Button>
          </Flex>
        </Flex>
      </>
    </Card>
  );
}
