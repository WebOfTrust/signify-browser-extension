import { useIntl } from "react-intl";
import { ICredential } from "@config/types";
import { Text, Subtext, Card, Flex, Box } from "@components/ui";
import CredentialIcon from "@components/shared/icons/credential";
import ValidIcon from "@components/shared/icons/valid";
import RevokedIcon from "@components/shared/icons/revoked";

export function CredentialCard({
  credential,
}: {
  credential: ICredential;
}): JSX.Element {
  const { formatMessage } = useIntl();

  return (
    <Card>
      <>
        <Flex flexDirection="row" justifyContent="space-between">
          <Text fontSize={1} fontWeight="bold" $color="heading">
            {credential.schema.title}
          </Text>
          <CredentialIcon size={6} />
        </Flex>
        <Box marginBottom={1} fontSize={0}>
          <Text $color="text">{credential.schema.credentialType}</Text>
        </Box>
        <Box marginBottom={1} fontSize={0}>
          <Text $color="text">{credential.schema.description}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text fontSize={0} fontWeight="bold" $color="heading">
            <>
              {formatMessage({ id: "credential.issuee.label" })}{" "}
              <Subtext fontWeight="normal" $color="text">
                {credential.issueeName}
              </Subtext>
            </>
          </Text>
        </Box>
        <Flex flexDirection="row" justifyContent="space-between" fontSize={0}>
          <div>
            <Text fontWeight="bold" $color="heading">
              {formatMessage({ id: "credential.lastUsed.label" })}{" "}
            </Text>
            <Text $color="text">November 08, 2023</Text>
          </div>
          {credential.status?.et === "iss" ? (
            <Flex flexDirection="column" alignItems="center" color="green">
              <ValidIcon size={6} />
              <Text $color="">{formatMessage({ id: "credential.valid" })}</Text>
            </Flex>
          ) : (
            <Flex flexDirection="column" alignItems="center" color="red">
              <RevokedIcon size={6} />
              <Text $color="">
                {formatMessage({ id: "credential.revoked" })}
              </Text>
            </Flex>
          )}
        </Flex>
      </>
    </Card>
  );
}
