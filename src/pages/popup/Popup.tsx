import {
  useState,
  useEffect,
  useRef,
  useMemo,
  createContext,
  useContext,
} from "react";
import { Toaster } from "react-hot-toast";
import { createGlobalStyle } from "styled-components";
import { UI_EVENTS } from "@config/event-types";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { sendMessageTab, getCurrentTab } from "@src/shared/browser/tabs-utils";
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
import { FileUpload } from "@src/screens/fileupload";
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
  const [showFileUpload, setShowFileUpload] = useState(false);

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
      try {
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
      } catch (error) {
        console.log("Error in popup from sendMessageTab", error);
      }
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
    setIsLoading(true);
    await sendMessage({ type: UI_EVENTS.authentication_disconnect_agent });
    await checkConnection();
    setIsLoading(false);
  };

  const handleDisconnectPermission = async () => {
    setIsLoading(true);
    await sendMessage({ type: UI_EVENTS.authentication_disconnect_agent });
    setPermissionData(false);
    await checkInitialConnection();
    setIsLoading(false);
  };

  const handleFileUpload = async (
    configFile: File | null,
    workflowFile: File | null,
  ) => {
    setIsLoading(true);
    setConnectError("");

    try {
      // Verify we have the needed files
      if (!configFile && !workflowFile) {
        throw new Error("At least one of config or workflow file is required");
      }

      // Read the contents of the uploaded files
      let configData: any = null;
      let workflowData: any = null;

      if (configFile) {
        const configText = await configFile.text();
        try {
          // Parse config based on file type (JSON or YAML)
          if (configFile.name.endsWith(".json")) {
            configData = JSON.parse(configText);
          } else if (
            configFile.name.endsWith(".yaml") ||
            configFile.name.endsWith(".yml")
          ) {
            // We need to import yaml parser dynamically since it might not be available in all contexts
            const { default: yaml } = await import("js-yaml");
            configData = yaml.load(configText);
          } else {
            throw new Error(
              "Unsupported config file format. Please use JSON or YAML.",
            );
          }
        } catch (parseError) {
          throw new Error(
            `Error parsing config file: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          );
        }
      }

      if (workflowFile) {
        const workflowText = await workflowFile.text();
        try {
          // Parse workflow based on file type (JSON or YAML)
          if (workflowFile.name.endsWith(".json")) {
            workflowData = JSON.parse(workflowText);
          } else if (
            workflowFile.name.endsWith(".yaml") ||
            workflowFile.name.endsWith(".yml")
          ) {
            const { default: yaml } = await import("js-yaml");
            workflowData = yaml.load(workflowText);
          } else {
            throw new Error(
              "Unsupported workflow file format. Please use JSON or YAML.",
            );
          }
        } catch (parseError) {
          throw new Error(
            `Error parsing workflow file: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          );
        }
      }

      console.log("Config data:", configData);
      console.log("Workflow data:", workflowData);

      // If either file is missing, try to get default data
      if (!configData) {
        // Use a default configuration
        console.log("No config file, using default config");
        const result = await sendMessage({
          type: UI_EVENTS.authentication_generate_passcode,
        });
        if (result.data?.passcode) {
          configData = {
            secrets: {
              browser_extension: result.data.passcode,
            },
            agents: {
              browser_extension: {
                secret: "browser_extension",
              },
            },
            identifiers: {},
            users: [],
            credentials: {},
          };
        } else {
          throw new Error("Failed to generate default configuration");
        }
      }

      if (!workflowData) {
        // Use a default workflow
        console.log("No workflow file, using default client workflow");
        workflowData = {
          workflow: {
            steps: {
              gleif_client: {
                id: "gleif_client",
                type: "create_client",
                agent_name: "gleif-agent-1",
                description: "Creating client from uploaded configuration",
              },
            },
          },
        };
      }

      // Store the workflow and config in extension storage for background script access
      const browser = await import("@src/shared/browser/extension-api").then(
        (m) => m.getExtensionApi(),
      );
      await browser.storage.local.set({
        uploaded_workflow: JSON.stringify(workflowData),
        uploaded_config: JSON.stringify(configData),
      });

      // Notify the background script to run the workflow
      const { data, error } = await sendMessage({
        type: UI_EVENTS.authentication_run_uploaded_workflow,
      });

      if (error) {
        throw new Error(`Error running workflow: ${error.message}`);
      }

      console.log("Workflow execution result:", data);

      // On successful completion, return to sign in
      setIsLoading(false);
      setShowFileUpload(false);

      // If the workflow execution requires a passcode, show a message
      if (data && data.requiresPasscode) {
        setConnectError("Please enter your passcode to complete the setup.");
        setTimeout(() => {
          setConnectError("");
        }, 5000);
      }
    } catch (error) {
      setIsLoading(false);
      setConnectError(
        error instanceof Error
          ? error.message
          : "Failed to process uploaded files",
      );
      setTimeout(() => {
        setConnectError("");
      }, 5000);
    }
  };

  const handleUserPreferences = async (autoSignin?: boolean) => {
    // ... existing code ...
  };

  const logo = vendorData?.logo ?? "/128_keri_logo.png";
  return (
    <LocaleProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
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
              ) : showFileUpload ? (
                <Box width="300px">
                  <FileUpload
                    isLoading={isLoading}
                    handleFileUpload={handleFileUpload}
                    fileUploadError={connectError}
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
                        handleFileUpload={() => setShowFileUpload(true)}
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
