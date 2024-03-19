import { useIntl } from "react-intl";
import { Text, Subtext, Card } from "@components/ui";
import CredentialIcon from "@components/shared/icons/credential";
import ValidIcon from "@components/shared/icons/valid";
import RevokedIcon from "@components/shared/icons/revoked";

interface ICredential {
  issueeName: string;
  schema: {
    title: string;
    credentialType: string;
    description: string;
  };
  status: {
    et: string;
  };
}

interface ICredentialCard {
  credential: ICredential;
}

export function CredentialCard({ credential }: ICredentialCard): JSX.Element {
  const { formatMessage } = useIntl();

  return (
    <Card>
      <>
        <div className="flex flex-row justify-between text-xs">
          <div>
            <Text className="font-bold" $color="heading">
              {credential.schema.title}
            </Text>
            <Text className="font-normal text-md" $color="text">
              {credential.schema.credentialType}
            </Text>
          </div>
          <CredentialIcon className="w-6 h-6" />
        </div>
        <div className="text-xs">
          <Text className="font-normal text-md" $color="text">
            {credential.schema.description}
          </Text>
          <Text className="font-bold" $color="heading">
            <>
              {formatMessage({ id: "credential.issue.label" })}{" "}
              <Subtext className="font-normal" $color="text">
                {credential.issueeName}
              </Subtext>
            </>
          </Text>
        </div>
        <div className="flex flex-row justify-between text-xs">
          <div className="">
            <Text className="font-bold" $color="heading">
              {formatMessage({ id: "credential.lastUsed.label" })}{" "}
            </Text>
            <Text className="font-normal" $color="text">
              November 08, 2023
            </Text>
          </div>
          {credential.status?.et === "iss" ? (
            <div className="flex flex-col items-center text-green">
              <ValidIcon className="w-6 h-6" />
              <p>{formatMessage({ id: "credential.valid" })}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-red">
              <RevokedIcon className="w-6 h-6" />
              <p>{formatMessage({ id: "credential.revoked" })}</p>
            </div>
          )}
        </div>
      </>
    </Card>
  );
}
