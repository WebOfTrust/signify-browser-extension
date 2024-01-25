import React, { useState, useEffect } from "react";
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

const StyledLoader = styled.div`
  background-color: ${(props) => props.theme?.colors?.primary};
`;

export default function Popup(): JSX.Element {
  const [vendorUrl, setVendorUrl] = useState("");
  const [vendorData, setVendorData] = useState();

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingInitialConnection, setIsCheckingInitialConnection] =
    useState(false);

  const handleSetVendorData = async () => {
    const _vendorData = await configService.getData();
    setVendorData(_vendorData);
  };

  const checkInitialConnection = async () => {
    setIsCheckingInitialConnection(true);
    await checkConnection();
    setIsCheckingInitialConnection(false);
  };

  const checkIfVendorUrlExist = async () => {
    const _vendorUrl = await configService.getUrl();
    if (_vendorUrl) {
      setVendorUrl(_vendorUrl);
      handleSetVendorData();
      checkInitialConnection();
    }
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
    checkIfVendorUrlExist();
  }, []);

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

  if (!vendorUrl || !vendorData) {
    return (
      <div className="w-[300px]">
        <Config afterSetUrl={checkIfVendorUrlExist} />
      </div>
    );
  }

  return (
    <ThemeProvider theme={vendorData.theme}>
      {isCheckingInitialConnection ? (
        <div className="w-[300px]">
          <StyledLoader className=" w-16 h-16 m-auto">
            <Loader size={12} />
          </StyledLoader>
        </div>
      ) : (
        <div>
          {isConnected ? (
            <Main handleDisconnect={handleDisconnect} />
          ) : (
            <div className="w-[300px]">
              <Signin handleConnect={handleConnect} isLoading={isLoading} />
            </div>
          )}
        </div>
      )}
    </ThemeProvider>
  );
}
