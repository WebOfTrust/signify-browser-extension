import { useState } from "react";
import { useIntl } from "react-intl";
import {
  WEB_APP_PERMS,
  configService,
} from "@pages/background/services/config";
import { isValidUrl, setActionIcon } from "@pages/background/utils";
import { Card, Button, Text } from "@components/ui";
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

  const checkErrorAgentUrl = async (_url: string) => {
    const urlObject = isValidUrl(_url);
    if (!_url || !urlObject) {
      return true;
    }
    if (urlObject && urlObject?.origin) {
      try {
        await (await fetch(`${urlObject?.origin}/health`)).json();
      } catch (error) {
        return true;
      }
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
  const handleSetAgentUrl = async (_url: string) => {
    const hasError = await checkErrorAgentUrl(_url);
    if (hasError) return;

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

      await configService.setData(resp);
      if (resp?.icon) {
        await setActionIcon(resp?.icon);
      }
    } catch (error) {
      setVendorUrlError(invalidVendorUrlError);
      setIsLoadingVendorUrl(false);
      hasError = true;
    }
    if (!hasError) {
      await configService.setUrl(permissionData?.vendorUrl);
      await removePostPermissionFlags();
      afterCallback();
    }
  };

  const handleCancel = async () => {
    await removePostPermissionFlags();
    afterCallback();
  };

  const handleProceedWithoutAgent = async () => {
    await configService.setData(receivedVendorData);
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

    await configService.setData(receivedVendorData);
    if (receivedVendorData?.icon) {
      await setActionIcon(receivedVendorData?.icon);
    }

    await removePostPermissionFlags();
    handleDisconnect();
  };

  return (
    <div className="p-4 relative">
      <div className="mb-2">
        <p className="text-sm font-bold">
          {formatMessage({
            id: "permissions.label.permissionRequired",
          })}
        </p>
      </div>
      <Card>
        {containsAgentUrl ? (
          <>
            <div className="mb-2">
              <Text className="font-bold text-xs" $color="heading">
                {formatMessage(
                  { id: "permissions.warning.containsAgentUrl" },
                  { url: receivedVendorData?.agentUrl }
                )}
              </Text>
            </div>
            <div className="flex flex-col gap-y-1">
              <Button
                handleClick={handleProceedWithAgent}
                className="text-white justify-center flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
              >
                <p className="font-medium text-md">
                  {formatMessage({ id: "permissions.action.yesProceed" })}
                </p>
              </Button>
              <Button
                handleClick={handleProceedWithoutAgent}
                className="text-white flex justify-center flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
              >
                <p className="font-medium text-md">
                  {formatMessage({
                    id: "permissions.action.noProceedWithoutAgent",
                  })}
                </p>
              </Button>
              <Button
                handleClick={handleCancel}
                className="text-white flex justify-center flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
              >
                <p className="font-medium text-md">
                  {formatMessage({ id: "action.cancel" })}
                </p>
              </Button>
            </div>
          </>
        ) : (
          <>
            <Text className="font-bold text-xs break-words" $color="heading">
              {formatMessage(
                { id: "permissions.desc.loadVendorUrl" },
                {
                  origin: permissionData?.origin,
                  url: permissionData?.vendorUrl,
                }
              )}
            </Text>

            {vendorUrlError ? (
              <p className="text-red">{vendorUrlError}</p>
            ) : null}

            <div className="flex flex-row justify-between mt-2">
              <Button
                handleClick={handleSetVendorUrl}
                isLoading={isLoadingVendorUrl}
                className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
              >
                <p className="font-medium text-md">
                  {formatMessage({ id: "action.allow" })}
                </p>
              </Button>
              <Button
                handleClick={handleCancel}
                className="text-white flex flex-row focus:outline-none font-medium rounded-full text-sm px-3 py-[2px]"
              >
                <p className="font-medium text-md">
                  {formatMessage({ id: "action.deny" })}
                </p>
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
