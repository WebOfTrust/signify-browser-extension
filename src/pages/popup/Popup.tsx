import { useState, useEffect } from "react";
import { createGlobalStyle } from "styled-components";
import { UI_EVENTS } from "@config/event-types";
import { sendMessage } from "@shared/runtime-utils";
import { sendMessageTab, getCurrentTab } from "@shared/tabs-utils";
import {
  WEB_APP_PERMS,
  configService,
} from "@pages/background/services/config";
import { isValidUrl } from "@shared/utils";
import { ThemeProvider, styled } from "styled-components";
import { LocaleProvider } from "@src/_locales";
import { default as defaultVendor } from "@src/config/vendor.json";
import { IVendorData } from "@config/types";
import { Permission } from "@src/screens/permission";
import { Signin } from "@src/screens/signin";
import { Signup } from "@src/screens/signup";
import { Loader, Box } from "@components/ui";
import { Main } from "@components/main";

interface IBootAndConnect {
  passcode?: string;
  agentUrl?: string;
  bootUrl: string;
}

interface IConnect {
  passcode?: string;
  agentUrl?: string;
}

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme?.colors?.bodyBg};
    color: ${({ theme }) => theme?.colors?.bodyColor};
    border: ${({ theme }) =>
      `1px solid ${theme?.colors?.bodyBorder ?? theme?.colors?.bodyBg}`};
    transition: background 0.2s ease-in, color 0.2s ease-in;
  }

  ul {
    list-style-type: none;
    padding: 0;

    > li {
      margin-bottom: 8px;
    }
  }
`;

const StyledLoaderBox = styled(Box)`
  color: ${(props) => props.theme?.colors?.primary};
`;

export default function Popup(): JSX.Element {
  const [vendorData, setVendorData] = useState<IVendorData>(defaultVendor);
  const [showConfig, setShowConfig] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const [permissionData, setPermissionData] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [isCheckingInitialConnection, setIsCheckingInitialConnection] =
    useState(false);

  const checkWebRequestedPermissions = async () => {
    const webRequestedPermissions =
      await configService.getWebRequestedPermissions();
    const requestedVendorUrlChange =
      webRequestedPermissions[WEB_APP_PERMS.SET_VENDOR_URL];
    setPermissionData(requestedVendorUrlChange);
  };

  const checkIfVendorDataExists = async () => {
    const resp = await configService.getAgentAndVendorInfo();
    if (resp.vendorData) {
      setVendorData(resp.vendorData);
    }

    if (!resp.agentUrl || !resp.hasOnboarded) {
      setShowConfig(true);
    }
  };

  const checkInitialConnection = async () => {
    setIsCheckingInitialConnection(true);
    await checkWebRequestedPermissions();
    await checkConnection();
    setIsCheckingInitialConnection(false);
  };

  const checkConnection = async () => {
    const { data } = await sendMessage({
      type: UI_EVENTS.authentication_check_agent_connection,
    });

    setIsConnected(!!data.isConnected);
    if (data.isConnected) {
      const tab = await getCurrentTab();
      const { data } = await sendMessageTab(tab.id!, {
        type: "tab",
        subtype: "get-tab-state",
      });
      sendMessageTab(tab.id!, {
        type: "tab",
        subtype: "reload-state",
        eventType: data?.tabState,
      });
    }
  };

  useEffect(() => {
    checkIfVendorDataExists();
    checkInitialConnection();
  }, []);

  const handleBootAndConnect = async (passcode: string) => {
    const agentUrl = await configService.getAgentUrl();
    const bootUrl = await configService.getBootUrl();
    const urlObject = isValidUrl(agentUrl);

    if (!urlObject || !urlObject?.origin) return;
    setIsLoading(true);

    const { data, error } = await sendMessage<IBootAndConnect>({
      type: UI_EVENTS.authentication_boot_connect_agent,
      data: {
        passcode,
        agentUrl,
        bootUrl,
      },
    });

    setIsLoading(false);
    if (error) {
      setConnectError(error?.message);
      setTimeout(() => {
        setConnectError("");
      }, 3000);
    } else {
      setShowSignup(false);
      await checkConnection();
    }
  };

  const handleConnect = async (passcode: string) => {
    setIsLoading(true);
    const agentUrl = await configService.getAgentUrl();
    const { data, error } = await sendMessage<IConnect>({
      type: UI_EVENTS.authentication_connect_agent,
      data: {
        passcode,
        agentUrl,
      },
    });

    setIsLoading(false);
    if (error) {
      setConnectError(error?.message);
      setTimeout(() => {
        setConnectError("");
      }, 3000);
    } else {
      await checkConnection();
    }
  };

  const handleDisconnect = async () => {
    await sendMessage({
      type: UI_EVENTS.authentication_disconnect_agent,
    });
    checkConnection();
  };

  const handleDisconnectPermission = async () => {
    await sendMessage({
      type: UI_EVENTS.authentication_disconnect_agent,
    });
    await checkConnection();
    checkIfVendorDataExists();
    checkWebRequestedPermissions();
  };

  const logo = vendorData?.logo ?? "/128_keri_logo.png";
  return (
    <LocaleProvider>
      <ThemeProvider theme={vendorData?.theme}>
        <GlobalStyles />
        <div>
          {isCheckingInitialConnection ? (
            <Box width="300px">
              <StyledLoaderBox margin="auto" width={64} height={64}>
                <Loader size={12} />
              </StyledLoaderBox>
            </Box>
          ) : (
            <>
              {permissionData ? (
                <Box width="300px">
                  <Permission
                    isConnected={isConnected}
                    permissionData={permissionData}
                    afterCallback={() => {
                      checkIfVendorDataExists();
                      checkWebRequestedPermissions();
                    }}
                    handleDisconnect={handleDisconnectPermission}
                  />
                </Box>
              ) : showSignup ? (
                <Box width="300px">
                  <Signup
                    isLoading={isLoading}
                    handleBootAndConnect={handleBootAndConnect}
                    signupError={connectError}
                  />
                </Box>
              ) : (
                <>
                  {isConnected ? (
                    <Main
                      handleDisconnect={handleDisconnect}
                      logo={logo}
                      title={vendorData?.title}
                    />
                  ) : (
                    <Box width="300px">
                      <Signin
                        signinError={connectError}
                        handleConnect={handleConnect}
                        isLoading={isLoading}
                        logo={logo}
                        title={vendorData?.title}
                        afterSetUrl={checkIfVendorDataExists}
                        vendorData={vendorData}
                        showConfig={showConfig}
                        setShowConfig={setShowConfig}
                        handleSignup={() => setShowSignup(true)}
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </ThemeProvider>
    </LocaleProvider>
  );
}
