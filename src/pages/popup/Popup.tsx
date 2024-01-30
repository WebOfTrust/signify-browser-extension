import { useState, useEffect } from "react";
import { createGlobalStyle } from "styled-components";
import { configService } from "@pages/background/services/config";
import { ThemeProvider, styled } from "styled-components";
import { IMessage } from "@pages/background/types";
import { Signin } from "@src/screens/signin";
import { Config } from "@src/screens/config";
import { Loader } from "@components/loader";
import { Main } from "@components/main";

// TODO Harcoded for initial development. Will be removed soon
const url = "https://keria-dev.rootsid.cloud/admin";
const boot_url = "https://keria-dev.rootsid.cloud";
const password = "CqjYb60NT9gZl8itwuttD9";

interface IConnect {
  passcode?: string;
  agentUrl?: string;
  bootUrl?: string;
}

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme?.colors?.body};
    transition: background 0.2s ease-in, color 0.2s ease-in;
  }
`;

const StyledLoader = styled.div`
  color: ${(props) => props.theme?.colors?.primary};
`;

export default function Popup(): JSX.Element {
  const [vendorData, setVendorData] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingInitialConnection, setIsCheckingInitialConnection] =
    useState(false);

  const checkIfVendorDataExists = async () => {
    const _vendorData = await configService.getData();
    if (_vendorData) {
      setVendorData(_vendorData);
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

  const handleConnect = async (passcode?: string) => {
    setIsLoading(true);
    await chrome.runtime.sendMessage<IMessage<IConnect>>({
      type: "authentication",
      subtype: "connect-agent",
      data: {
        passcode: password,
        agentUrl: url,
        bootUrl: boot_url,
      },
    });
    await checkConnection();
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    await chrome.runtime.sendMessage<IMessage<void>>({
      type: "authentication",
      subtype: "disconnect-agent",
    });
    checkConnection();
  };

  if (!vendorData) {
    return (
      <div className="w-[300px]">
        <Config afterSetUrl={checkIfVendorDataExists} />
      </div>
    );
  }

  return (
    <ThemeProvider theme={vendorData.theme}>
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
                  handleConnect={handleConnect}
                  isLoading={isLoading}
                  logo={vendorData?.logo}
                  title={vendorData?.title}
                  afterSetUrl={checkIfVendorDataExists}
                />
              </div>
            )}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
