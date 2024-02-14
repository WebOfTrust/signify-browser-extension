import { useState, useEffect } from "react";
import { createGlobalStyle } from "styled-components";
import { configService } from "@pages/background/services/config";
import { ThemeProvider, styled } from "styled-components";
import { LocaleProvider } from "@src/_locales";
import { default as defaultVendor } from "@src/config/vendor.json";
import { IMessage } from "@pages/background/types";
import { Signin } from "@src/screens/signin";
import { Loader } from "@components/loader";
import { Main } from "@components/main";

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
`;

const StyledLoader = styled.div`
  color: ${(props) => props.theme?.colors?.primary};
`;

export default function Popup(): JSX.Element {
  const [vendorData, setVendorData] = useState();
  const [showConfig, setShowConfig] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [isCheckingInitialConnection, setIsCheckingInitialConnection] =
    useState(false);

  const checkIfVendorDataExists = async () => {
    const _vendorData = await configService.getData();
    if (_vendorData) {
      setVendorData(_vendorData);
    } else {
      setShowConfig(true);
    }
  };

  const checkInitialConnection = async () => {
    setIsCheckingInitialConnection(true);
    await checkConnection();
    setIsCheckingInitialConnection(false);
  };

  const checkConnection = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "authentication",
      subtype: "check-agent-connection",
    });

    setIsConnected(!!data.isConnected);
    if (data.isConnected) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length === 1) {
          console.log("realoading tab");
          chrome.tabs.sendMessage(tabs[0].id!, {
            type: "tab",
            subtype: "reload-state",
          });
        }
      });
    }
  };

  useEffect(() => {
    checkIfVendorDataExists();
  }, []);

  useEffect(() => {
    if (vendorData) {
      checkInitialConnection();
    }
  }, [vendorData]);

  const handleConnect = async (passcode: string) => {
    setIsLoading(true);
    const agentUrl = await configService.getAgentUrl();
    const { data, error } = await chrome.runtime.sendMessage<
      IMessage<IConnect>
    >({
      type: "authentication",
      subtype: "connect-agent",
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
    await chrome.runtime.sendMessage<IMessage<void>>({
      type: "authentication",
      subtype: "disconnect-agent",
    });
    checkConnection();
  };

  return (
    <LocaleProvider>
      <ThemeProvider theme={vendorData?.theme ?? defaultVendor?.theme}>
        <GlobalStyles />
        <div>
          {isCheckingInitialConnection ? (
            <div className="w-[300px]">
              <StyledLoader className=" w-16 h-16 m-auto">
                <Loader size={12} />
              </StyledLoader>
            </div>
          ) : (
            <>
              {isConnected ? (
                <Main
                  handleDisconnect={handleDisconnect}
                  logo={vendorData?.logo}
                  title={vendorData?.title}
                />
              ) : (
                <div className="w-[300px]">
                  <Signin
                    signinError={connectError}
                    handleConnect={handleConnect}
                    isLoading={isLoading}
                    logo={vendorData?.logo}
                    title={vendorData?.title}
                    afterSetUrl={checkIfVendorDataExists}
                    vendorData={vendorData}
                    showConfig={showConfig}
                    setShowConfig={setShowConfig}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </ThemeProvider>
    </LocaleProvider>
  );
}
