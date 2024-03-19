import { useIntl } from "react-intl";
import { Card, Button, Text, Switch } from "@components/ui";
import SigninIcon from "@components/shared/icons/signin";
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
        <div className="flex flex-row justify-between text-xs">
          <div>
            <Text className="font-bold" $color="heading">
              {formatMessage({ id: "signin.website" })}
            </Text>
            <Text className="font-normal text-md" $color="text">
              {signin?.domain}
            </Text>
          </div>
          <SigninIcon className="w-6 h-6" />
        </div>

        <div className="flex flex-row justify-between text-xs">
          <div>
            <Text className="font-bold" $color="heading">
              {signin?.identifier
                ? formatMessage({ id: "signin.identifierAlias" })
                : formatMessage({ id: "credential.title" })}
            </Text>
            <Text className="font-normal text-md" $color="text">
              {signin?.identifier?.name}
            </Text>
          </div>
          <div>
            <Text className="font-bold" $color="heading">
              {formatMessage({ id: "signin.lastUsed.label" })}
            </Text>
            <Text className="font-normal text-md" $color="text">
              {new Date(signin?.updatedAt).toDateString()}
            </Text>
          </div>
        </div>
        <div className="flex flex-row justify-between text-xs">
          <div>
            <Text className="font-bold" $color="heading">
              {formatMessage({ id: "signin.autoSignin" })}
            </Text>
            <Switch
              isChecked={signin.autoSignin}
              handleToggle={handleAutoSignin}
            />
          </div>
          <div className="flex items-end">
            <Button
              handleClick={handleDelete}
              className="text-white hover:bg-red font-medium rounded-full text-xs px-2 py-1"
            >
              <>{formatMessage({ id: "action.delete" })}</>
            </Button>
          </div>
        </div>
      </>
    </Card>
  );
}
