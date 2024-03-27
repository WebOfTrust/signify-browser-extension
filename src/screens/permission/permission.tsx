import { useState } from "react";
import { useIntl } from "react-intl";
import {
  WEB_APP_PERMS,
  configService,
} from "@pages/background/services/config";
import { isValidUrl, getBootUrl, setActionIcon } from "@pages/background/utils";
import { Box, Card, Button, Text, Flex } from "@components/ui";
import { IMessage } from "@config/types";

interface IPermissions {
  permissionData: any;
  isConnected: boolean;
  afterCallback: () => void;
  handleDisconnect: () => void;
}

export function Permission({
  permissionData,
  isConnected,
  afterCallback,
  handleDisconnect,
}: IPermissions): JSX.Element {
  const [receivedVendorData, setReceivedVendorData] = useState<any>();
  const [containsAgentUrl, setContainsAgentUrl] = useState(false);
  const [isLoadingVendorUrl, setIsLoadingVendorUrl] = useState(false);
  const [vendorUrlError, setVendorUrlError] = useState("");

  const { formatMessage } = useIntl();
  const validUrlMsg = formatMessage({ id: "config.error.enterUrl" });
  const invalidVendorUrlError = formatMessage({
    id: "config.error.invalidVendorUrl",
  });

  const checkErrorVendorUrl = () => {
    if (!permissionData?.vendorUrl || !isValidUrl(permissionData?.vendorUrl)) {
      setVendorUrlError(validUrlMsg);
      return true;
    } else {
      setVendorUrlError("");
      return false;
    }
  };

  const removePostPermissionFlags = async () => {
    await configService.setWebRequestedPermission(
      WEB_APP_PERMS.SET_VENDOR_URL,
      "delete"
    );
    await chrome.runtime.sendMessage<IMessage<void>>({
      type: "action-icon",
      subtype: "unset-action-icon",
    });
  };

  const handleSetBootUrl = async (_url: string) => {
    if (!isValidUrl(_url)) return;
    await configService.setBootUrl(_url);
  };

  const handleSetAgentUrl = async (_url: string) => {
    if (!_url || !isValidUrl(_url)) return;

    await configService.setAgentUrl(_url);
    await configService.setHasOnboarded(true);
  };

  const handleSetVendorUrl = async () => {
    let hasError = checkErrorVendorUrl();
    try {
      setIsLoadingVendorUrl(true);
      const resp = await (await fetch(permissionData?.vendorUrl)).json();
      setIsLoadingVendorUrl(false);
      setReceivedVendorData(resp);

      if (resp?.agentUrl && isConnected) {
        setContainsAgentUrl(true);
        return;
      }

      if (resp?.agentUrl) {
        await handleSetAgentUrl(resp?.agentUrl);
      }

      if(resp?.bootUrl) {
        await handleSetBootUrl(resp?.bootUrl);
      }

      await configService.setVendorData(resp);
      if (resp?.icon) {
        await setActionIcon(resp?.icon);
      }
    } catch (error) {
      setVendorUrlError(invalidVendorUrlError);
      setIsLoadingVendorUrl(false);
      hasError = true;
    }
    if (!hasError) {
      await configService.setVendorUrl(permissionData?.vendorUrl);
      await removePostPermissionFlags();
      afterCallback();
    }
  };

  const handleCancel = async () => {
    await removePostPermissionFlags();
    afterCallback();
  };

  const handleProceedWithoutAgent = async () => {
    await configService.setVendorData(receivedVendorData);
    if (receivedVendorData?.icon) {
      await setActionIcon(receivedVendorData?.icon);
    }

    await removePostPermissionFlags();
    afterCallback();
  };

  const handleProceedWithAgent = async () => {
    if (receivedVendorData?.agentUrl) {
      await handleSetAgentUrl(receivedVendorData?.agentUrl);
    }

    await configService.setVendorData(receivedVendorData);
    if (receivedVendorData?.icon) {
      await setActionIcon(receivedVendorData?.icon);
    }

    await removePostPermissionFlags();
    handleDisconnect();
  };

  return (
    <Box padding={3} position="relative">
      <Box marginBottom={2}>
        <Text fontSize={1} fontWeight="bold" $color="">
          {formatMessage({
            id: "permissions.label.permissionRequired",
          })}
        </Text>
      </Box>
      <Card>
        {containsAgentUrl ? (
          <>
            <Box marginBottom={2}>
              <Text fontWeight="bold" fontSize={0} $color="heading">
                {formatMessage(
                  { id: "permissions.warning.containsAgentUrl" },
                  { url: receivedVendorData?.agentUrl }
                )}
              </Text>
            </Box>
            <Flex flexDirection="column" $flexGap={1}>
              <Button handleClick={handleProceedWithAgent}>
                <Text $color="">
                  {formatMessage({ id: "permissions.action.yesProceed" })}
                </Text>
              </Button>
              <Button handleClick={handleProceedWithoutAgent}>
                <Text $color="">
                  {formatMessage({
                    id: "permissions.action.noProceedWithoutAgent",
                  })}
                </Text>
              </Button>
              <Button handleClick={handleCancel}>
                <Text $color="">{formatMessage({ id: "action.cancel" })}</Text>
              </Button>
            </Flex>
          </>
        ) : (
          <>
            <Text fontWeight="bold" fontSize={0} $breakWord $color="heading">
              {formatMessage(
                { id: "permissions.desc.loadVendorUrl" },
                {
                  origin: permissionData?.origin,
                  url: permissionData?.vendorUrl,
                }
              )}
            </Text>

            {vendorUrlError ? (
              <Text $color="error">{vendorUrlError}</Text>
            ) : null}

            <Flex
              flexDirection="row"
              justifyContent="space-between"
              marginTop={2}
            >
              <Button
                handleClick={handleSetVendorUrl}
                isLoading={isLoadingVendorUrl}
              >
                <Text $color="">{formatMessage({ id: "action.allow" })}</Text>
              </Button>
              <Button handleClick={handleCancel}>
                <Text $color="">{formatMessage({ id: "action.deny" })}</Text>
              </Button>
            </Flex>
          </>
        )}
      </Card>
    </Box>
  );
}
